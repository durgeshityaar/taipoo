import type { FormDefinition } from "@taipoo/form-core";
import { AppError, notFound } from "../../lib/errors";
import * as data from "./forms.data";

const blankForm: FormDefinition = { title: "", questions: [], settings: {} };

export const createForm = (userId: string, draft: FormDefinition = blankForm) => data.insertForm(userId, draft);

export const listForms = (userId: string) => data.listFormsByOwner(userId);

export async function getForm(userId: string, formId: string) {
  const form = await data.findOwnedForm(formId, userId);
  if (!form) throw notFound("Form");
  return form;
}

export async function updateDraft(userId: string, formId: string, draft: FormDefinition) {
  const form = await data.updateOwnedDraft(formId, userId, draft);
  if (!form) throw notFound("Form");
  return form;
}

export async function publishForm(userId: string, formId: string) {
  const form = await getForm(userId, formId);
  if (!form.draft.title) {
    throw new AppError(422, "untitled_form", "Add a title before publishing");
  }
  if (form.draft.questions.length === 0) {
    throw new AppError(422, "empty_form", "Add at least one question before publishing");
  }
  const version = await data.publishOwnedDraft(formId, userId);
  if (!version) throw notFound("Form"); // deleted between the check and the publish
  return version;
}
