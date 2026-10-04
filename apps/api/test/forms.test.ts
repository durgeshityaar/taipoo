import { describe, expect, test } from "bun:test";
import { client, sampleDraft as draft, signedInClient } from "./helpers";

describe("/api/forms", () => {
  test("GET / without a session → 401", async () => {
    const res = await client().forms.$get();
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: { code: "unauthorized" } });
  });

  test("create → list → update draft → publish twice → get", async () => {
    const forms = (await signedInClient()).forms;

    const created = await forms.$post({ json: {} });
    expect(created.status).toBe(201);
    const form = await created.json();
    expect(form).toMatchObject({ draft: { title: "", questions: [] }, publishedVersionId: null });
    expect((await (await forms[":id"].$get({ param: { id: form.id } })).json()).publishedDefinition).toBeNull();
    expect(form.slug).toMatch(/^[0-9a-f]{12}$/);

    const list = await (await forms.$get()).json();
    expect(list).toEqual([expect.objectContaining({ id: form.id, title: "" })]);

    const updated = await forms[":id"].draft.$put({ param: { id: form.id }, json: draft });
    expect(updated.status).toBe(200);
    expect((await updated.json()).draft.title).toBe("Feedback");

    const v1 = await (await forms[":id"].publish.$post({ param: { id: form.id } })).json();
    const v2 = await (await forms[":id"].publish.$post({ param: { id: form.id } })).json();
    expect([v1.version, v2.version]).toEqual([1, 2]);
    expect(v2.definition.title).toBe("Feedback");

    const got = await (await forms[":id"].$get({ param: { id: form.id } })).json();
    expect(got.publishedVersionId).toBe(v2.id);
    expect(got.publishedDefinition?.title).toBe("Feedback");
  });

  test("publishing a form with no questions → 422", async () => {
    const forms = (await signedInClient()).forms;
    const form = await (await forms.$post({ json: { draft: { ...draft, questions: [] } } })).json();
    const res = await forms[":id"].publish.$post({ param: { id: form.id } });
    expect(res.status as number).toBe(422); // thrown errors aren't in the RPC types, only returned responses
    expect(await res.json()).toMatchObject({ error: { code: "not_publishable", details: [{ path: "questions" }] } });
  });

  test("publishing an untitled form → 422", async () => {
    const forms = (await signedInClient()).forms;
    const form = await (await forms.$post({ json: { draft: { ...draft, title: "" } } })).json();
    const res = await forms[":id"].publish.$post({ param: { id: form.id } });
    expect(res.status as number).toBe(422);
    expect(await res.json()).toMatchObject({ error: { code: "not_publishable", details: [{ path: "title" }] } });
  });

  test("invalid draft → 400 with per-field details", async () => {
    const forms = (await signedInClient()).forms;
    const form = await (await forms.$post({ json: {} })).json();
    const res = await forms[":id"].draft.$put({
      param: { id: form.id },
      json: { ...draft, questions: [{ id: "q1", type: "email", title: "x".repeat(501) }] },
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      error: { code: "invalid_input", details: [{ path: "questions.0.title" }] },
    });
  });

  test("empty question title saves as draft but blocks publish", async () => {
    const forms = (await signedInClient()).forms;
    const form = await (await forms.$post({ json: {} })).json();
    const saved = await forms[":id"].draft.$put({
      param: { id: form.id },
      json: { ...draft, questions: [{ id: "q1", type: "email", title: "" }] },
    });
    expect(saved.status).toBe(200);
    const res = await forms[":id"].publish.$post({ param: { id: form.id } });
    expect(res.status as number).toBe(422);
    expect(await res.json()).toMatchObject({
      error: { code: "not_publishable", details: [{ path: "questions.0.title", message: "Required" }] },
    });
  });

  test("another user's form and malformed ids → 404", async () => {
    const alice = (await signedInClient()).forms;
    const bob = (await signedInClient()).forms;
    const form = await (await alice.$post({ json: { draft } })).json();

    for (const res of [
      await bob[":id"].$get({ param: { id: form.id } }),
      await bob[":id"].draft.$put({ param: { id: form.id }, json: draft }),
      await bob[":id"].publish.$post({ param: { id: form.id } }),
      await alice[":id"].$get({ param: { id: "not-a-uuid" } }),
    ]) {
      expect(res.status).toBe(404);
    }
    expect(await (await bob.$get()).json()).toEqual([]);
  });

  test("body over 1 MB → 413", async () => {
    const forms = (await signedInClient()).forms;
    const res = await forms.$post({ json: { draft: { ...draft, description: "x".repeat(1024 * 1024) } } });
    expect(res.status as number).toBe(413);
  });
});
