import { describe, expect, test } from "bun:test";
import type { formDraft } from "@taipoo/form-core";
import type { z } from "zod";
import { client, sampleDraft, signedInClient } from "./helpers";

type Api = Awaited<ReturnType<typeof signedInClient>>;
const visitor = client().f; // public routes, no session

// Creates and publishes a form as `owner`; returns what a visitor needs to submit to it.
async function publishForm(owner: Api, draft: z.input<typeof formDraft> = sampleDraft) {
  const form = await (await owner.forms.$post({ json: { draft } })).json();
  const version = await (await owner.forms[":id"].publish.$post({ param: { id: form.id } })).json();
  return { id: form.id, slug: form.slug, versionId: version.id };
}

const submit = (slug: string, json: { versionId: string; answers: Record<string, unknown>; website?: string }) =>
  visitor[":slug"].responses.$post({ param: { slug }, json: json as never });

describe("public form: GET /api/f/:slug", () => {
  test("404 until published; then only the published version is visible", async () => {
    const owner = await signedInClient();
    const draftOnly = await (await owner.forms.$post({ json: { draft: sampleDraft } })).json();
    expect((await visitor[":slug"].$get({ param: { slug: draftOnly.slug } })).status as number).toBe(404);

    const { id, slug, versionId } = await publishForm(owner);
    await owner.forms[":id"].draft.$put({ param: { id }, json: { ...sampleDraft, title: "Unpublished edit" } });

    const res = await visitor[":slug"].$get({ param: { slug } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ slug, versionId, definition: expect.objectContaining({ title: "Feedback" }) });
    expect(JSON.stringify(body)).not.toContain("owner"); // no draft, no owner details
  });

  test("unknown or malformed slug → 404", async () => {
    for (const slug of ["000000000000", "NOT_A_SLUG!"]) {
      expect((await visitor[":slug"].$get({ param: { slug } })).status as number).toBe(404);
    }
  });
});

describe("POST /api/f/:slug/responses", () => {
  test("valid answers are stored, trimmed", async () => {
    const owner = await signedInClient();
    const form = await publishForm(owner);

    const res = await submit(form.slug, { versionId: form.versionId, answers: { q1: "  Ada  " } });
    expect(res.status).toBe(201);

    const page = await (await owner.forms[":id"].responses.$get({ param: { id: form.id }, query: {} })).json();
    expect(page.items.map((r) => r.answers)).toEqual([{ q1: "Ada" }]);
  });

  test("answers that don't fit the form → 400 with per-question details", async () => {
    const form = await publishForm(await signedInClient());
    const res = await submit(form.slug, { versionId: form.versionId, answers: { q1: "", extra: "x" } });
    expect(res.status as number).toBe(400);
    const { error } = (await res.json()) as unknown as { error: { code: string; message: string; details: { path: string }[] } };
    expect(error).toMatchObject({ code: "invalid_input", message: "Invalid answers" });
    expect(error.details.map((d) => d.path).sort()).toEqual(["", "q1"]); // "" = unrecognized key "extra"
  });

  test("answering an outdated version → 409 form_updated", async () => {
    const owner = await signedInClient();
    const form = await publishForm(owner);
    await owner.forms[":id"].publish.$post({ param: { id: form.id } }); // owner republishes → version 2

    const res = await submit(form.slug, { versionId: form.versionId, answers: { q1: "Ada" } });
    expect(res.status as number).toBe(409);
    expect(await res.json()).toMatchObject({ error: { code: "form_updated" } });
  });

  test("honeypot filled → looks successful, nothing stored", async () => {
    const owner = await signedInClient();
    const form = await publishForm(owner);
    const res = await submit(form.slug, { versionId: form.versionId, answers: { q1: "bot" }, website: "spam.example" });
    expect(res.status).toBe(201);
    const page = await (await owner.forms[":id"].responses.$get({ param: { id: form.id }, query: {} })).json();
    expect(page.items).toEqual([]);
  });

  test("more than 10 submissions a minute to one form → 429 with Retry-After", async () => {
    const form = await publishForm(await signedInClient());
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const res = await submit(form.slug, { versionId: form.versionId, answers: { q1: `v${i}` } });
      statuses.push(res.status);
      if ((res.status as number) === 429) expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    }
    expect(statuses).toEqual([...Array(10).fill(201), 429]);
  });
});

describe("owner: GET /api/forms/:id/responses", () => {
  test("pages newest first with a cursor", async () => {
    const owner = await signedInClient();
    const form = await publishForm(owner);
    for (const name of ["first", "second", "third"]) {
      await submit(form.slug, { versionId: form.versionId, answers: { q1: name } });
    }
    const list = (query: { cursor?: string; limit?: string }) =>
      owner.forms[":id"].responses.$get({ param: { id: form.id }, query }).then((r) => r.json());

    const p1 = await list({ limit: "2" });
    expect(p1.items.map((r) => r.answers.q1)).toEqual(["third", "second"]);
    expect(p1.nextCursor).toBe(p1.items[1]!.id);

    const p2 = await list({ limit: "2", cursor: p1.nextCursor! });
    expect(p2.items.map((r) => r.answers.q1)).toEqual(["first"]);
    expect(p2.nextCursor).toBeNull();
    expect([p1.total, p2.total]).toEqual([3, 3]);
    expect(await (await owner.forms.$get()).json()).toEqual([expect.objectContaining({ id: form.id, responseCount: 3 })]);
    expect(p1.versions).toEqual([{ id: form.versionId, definition: expect.objectContaining({ title: "Feedback" }) }]);
  });

  test("another user's form → 404; no session → 401", async () => {
    const form = await publishForm(await signedInClient());
    const stranger = await signedInClient();
    expect((await stranger.forms[":id"].responses.$get({ param: { id: form.id }, query: {} })).status as number).toBe(404);
    expect((await client().forms[":id"].responses.$get({ param: { id: form.id }, query: {} })).status as number).toBe(401);
  });
});

describe("owner: GET /api/forms/:id/responses.csv", () => {
  const name = { id: "name", type: "short_text" as const, title: "Name" };
  const food = { id: "food", type: "multiple_choice" as const, title: "Food", options: [{ id: "p", label: "Pizza" }, { id: "s", label: "Sushi" }] };
  const draft = { title: "Team lunch!", questions: [name, { id: "gone", type: "email" as const, title: "Email" }, food] };

  test("one column per question across versions, labels as answered, escaped cells", async () => {
    const owner = await signedInClient();
    const v1 = await publishForm(owner, draft);
    await submit(v1.slug, { versionId: v1.versionId, answers: { name: 'Ada, "the" first', gone: "ada@example.com", food: "p" } });

    // v2: Pizza renamed, Email deleted
    await owner.forms[":id"].draft.$put({
      param: { id: v1.id },
      json: { ...draft, questions: [name, { ...food, options: [{ id: "p", label: "Pizza slice" }, { id: "s", label: "Sushi" }] }] },
    });
    const v2 = await (await owner.forms[":id"].publish.$post({ param: { id: v1.id } })).json();
    await submit(v1.slug, { versionId: v2.id, answers: { name: "=HYPERLINK(1)", food: "p" } });

    const res = await owner.forms[":id"]["responses.csv"].$get({ param: { id: v1.id } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="team-lunch-responses.csv"');
    const lines = (await res.text()).replace(/^\uFEFF/, "").trimEnd().split("\r\n");
    expect(lines[0]).toBe("Submitted at,Name,Food,Email");
    expect(lines[1]).toMatch(/^\d{4}-\d\d-\d\dT[^,]+,'=HYPERLINK\(1\),Pizza slice,$/); // newest first; formula neutralized
    expect(lines[2]).toMatch(/,"Ada, ""the"" first",Pizza,ada@example.com$/); // old label kept
  });

  test("another user's form → 404", async () => {
    const form = await publishForm(await signedInClient(), draft);
    const stranger = await signedInClient();
    expect((await stranger.forms[":id"]["responses.csv"].$get({ param: { id: form.id } })).status as number).toBe(404);
  });
});
