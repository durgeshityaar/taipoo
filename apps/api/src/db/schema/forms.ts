import type { FormDefinition, FormDraft } from "@taipoo/form-core";
import { sql } from "drizzle-orm";
import { index, integer, pgTable, text, unique, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";
import { jsonb, timestamptz, uuidv7 } from "../columns";
import { user } from "./auth";

// The editable form. Visitors never see `draft`; they see the version `publishedVersionId` points at.
export const forms = pgTable(
  "forms",
  {
    id: uuidv7(),
    ownerId: text() // text: Better Auth user ids are strings
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // public URL /f/<slug>: 12 random hex chars (48 bits) from a v4 uuid; the unique constraint backstops collisions
    slug: text()
      .notNull()
      .unique()
      .default(sql`left(replace(gen_random_uuid()::text, '-', ''), 12)`),
    draft: jsonb().$type<FormDraft>().notNull(),
    publishedVersionId: uuid().references((): AnyPgColumn => formVersions.id, { onDelete: "set null" }), // null = not published
    createdAt: timestamptz().notNull().defaultNow(),
    updatedAt: timestamptz()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.ownerId)],
);

// Immutable snapshot taken on each publish. Responses point here, so editing the draft never breaks old results.
export const formVersions = pgTable(
  "form_versions",
  {
    id: uuidv7(),
    formId: uuid()
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    version: integer().notNull(), // 1, 2, 3… per form
    definition: jsonb().$type<FormDefinition>().notNull(),
    publishedAt: timestamptz().notNull().defaultNow(),
  },
  (t) => [unique().on(t.formId, t.version)],
);
