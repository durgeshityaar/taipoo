import { answersSchemaFor } from "@taipoo/form-core";
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

export async function listResponses(userId: string, formId: string, page: PageQuery) {
  await getForm(userId, formId); // 404 unless the caller owns the form
  return toPage(await data.listByForm(formId, page), page.limit);
}
