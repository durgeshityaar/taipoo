import { relations } from "drizzle-orm";
import { user } from "./schema/auth";
import { formVersions, forms } from "./schema/forms";
import { responses } from "./schema/responses";

// Relations for db.query.* (no effect on the SQL schema). Better Auth's own relations live in schema/auth.ts.
// forms ↔ form_versions has two links (all versions, and the published one), so each needs a relationName.

export const formsRelations = relations(forms, ({ one, many }) => ({
  owner: one(user, { fields: [forms.ownerId], references: [user.id] }),
  versions: many(formVersions, { relationName: "form_versions" }),
  publishedVersion: one(formVersions, {
    fields: [forms.publishedVersionId],
    references: [formVersions.id],
    relationName: "published_version",
  }),
  responses: many(responses),
}));

export const formVersionsRelations = relations(formVersions, ({ one, many }) => ({
  form: one(forms, { fields: [formVersions.formId], references: [forms.id], relationName: "form_versions" }),
  responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  form: one(forms, { fields: [responses.formId], references: [forms.id] }),
  formVersion: one(formVersions, { fields: [responses.formVersionId], references: [formVersions.id] }),
}));
