import { formDefinition, type FormDraft } from "@taipoo/form-core";
import { AppError, notFound, toDetails } from "../../lib/errors";
import * as data from "./forms.data";

const blankForm: FormDraft = { title: "", questions: [], settings: {} };

export const createForm = (userId: string, draft: FormDraft = blankForm) => data.insertForm(userId, draft);

export const listForms = (userId: string) => data.listFormsByOwner(userId);

export async function getForm(userId: string, formId: string) {
  const form = await data.findOwnedForm(formId, userId);
  if (!form) throw notFound("Form");
  return form;
}

export async function updateDraft(userId: string, formId: string, draft: FormDraft) {
  const form = await data.updateOwnedDraft(formId, userId, draft);
  if (!form) throw notFound("Form");
  return form;
}

export async function publishForm(userId: string, formId: string) {
  const form = await getForm(userId, formId);
  // Drafts are only checked for structure; publishing also needs a title, questions, titled questions…
  const ready = formDefinition.safeParse(form.draft);
  if (!ready.success) throw new AppError(422, "not_publishable", "Fix these before publishing", toDetails(ready.error));
  const version = await data.publishOwnedDraft(formId, userId);
  if (!version) throw notFound("Form"); // deleted between the check and the publish
  return version;
}
