import type { Answers } from "@taipoo/form-core";
import { index, pgTable, uuid } from "drizzle-orm/pg-core";
import { jsonb, timestamptz, uuidv7 } from "../columns";
import { formVersions, forms } from "./forms";

// One submission. `formVersionId` records exactly which questions the person answered.
export const responses = pgTable(
  "responses",
  {
    id: uuidv7(),
    formId: uuid() // denormalized from the version so listing a form's responses needs no join
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    formVersionId: uuid()
      .notNull()
      .references(() => formVersions.id, { onDelete: "cascade" }),
    answers: jsonb().$type<Answers>().notNull(),
    submittedAt: timestamptz().notNull().defaultNow(),
  },
  (t) => [index().on(t.formId, t.id)], // results page: a form's responses newest first (uuidv7 ids are time-ordered)
);
