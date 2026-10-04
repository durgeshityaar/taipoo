import { answersSchemaFor, formatAnswer, resultColumns } from "@taipoo/form-core";
import { toCsv } from "../../lib/csv";
import { AppError, invalidInput, notFound } from "../../lib/errors";
import { toPage, type PageQuery } from "../../lib/pagination";
import { getForm } from "../forms/forms.service";
import * as data from "./responses.data";

async function getPublished(slug: string) {
  const published = await data.findPublishedBySlug(slug);
  if (!published) throw notFound("Form");
  return published;
}

// What a visitor sees: the published definition only — never the draft, owner, or internal ids beyond
// the version id they must echo back on submit.
export async function getPublicForm(slug: string) {
  const { version } = await getPublished(slug);
  return { slug, versionId: version.id, definition: version.definition };
}

export type Submission = { versionId: string; answers: unknown; website?: string };

export async function submitResponse(slug: string, submission: Submission) {
  const { formId, version } = await getPublished(slug);

  // Answers must match the questions the visitor actually saw. If the owner republished since the page
  // loaded, those questions may be gone or changed, so make the client reload instead of storing a mismatch.
  if (submission.versionId !== version.id) {
    throw new AppError(409, "form_updated", "This form was updated. Reload to see the latest version.");
  }

  // Honeypot: a hidden field real visitors never fill. Bots that do get a normal-looking success, stored nowhere.
  if (submission.website) return;

  const parsed = answersSchemaFor(version.definition).safeParse(submission.answers);
  if (!parsed.success) throw invalidInput(parsed.error, "Invalid answers");

  await data.insertResponse({ formId, formVersionId: version.id, answers: parsed.data });
}

// A page of responses, plus what's needed to read them: the total, and every version (newest first) so rows
// can be labelled with the questions they were answered against.
// ponytail: all versions ride along on every page; fine at dozens of versions, own endpoint if forms get republished a lot.
export async function listResponses(userId: string, formId: string, page: PageQuery) {
  await getForm(userId, formId); // 404 unless the caller owns the form
  const [rows, total, versions] = await Promise.all([
    data.listByForm(formId, page),
    data.countByForm(formId),
    data.listVersions(formId),
  ]);
  return { ...toPage(rows, page.limit), total, versions };
}

// Every response as CSV: "Submitted at" plus one column per question (see resultColumns), option labels as the
// respondent saw them.
// ponytail: builds the whole file in memory; stream it if a form reaches tens of thousands of responses.
export async function exportResponsesCsv(userId: string, formId: string) {
  const form = await getForm(userId, formId);
  const [rows, versions] = await Promise.all([data.listAllByForm(formId), data.listVersions(formId)]);
  const byId = new Map(versions.map((v) => [v.id, v.definition]));
  const columns = resultColumns(versions.map((v) => v.definition));
  const csv = toCsv([
    ["Submitted at", ...columns.map((q) => q.title)],
    ...rows.map((r) => {
      const version = byId.get(r.formVersionId);
      return [
        r.submittedAt.toISOString(),
        ...columns.map((c) => formatAnswer(version?.questions.find((q) => q.id === c.id), r.answers[c.id])),
      ];
    }),
  ]);
  const name = (form.draft.title || "form").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "form";
  return { csv, filename: `${name}-responses.csv` };
}
