import { z } from "zod";
import type { FormDefinition } from "./form";
import { questionsOf } from "./blocks";
import { answerValidators, type Question } from "./questions";

// Stored shape of a submission: questionId → answer. Unanswered optional questions are omitted.
export const answers = z.record(z.string(), z.union([z.string(), z.array(z.string())]));
export type Answers = z.infer<typeof answers>;

// Per-type validators live with their question type (questions/<type>.ts). TS can't correlate
// q.type with the lookup's parameter type, hence the cast; answerValidators' type guarantees the match.
const valueSchemaFor = (q: Question) => (answerValidators[q.type] as (q: Question) => z.ZodType<string | string[]>)(q);

// One definition of "unanswered" for every type: missing, blank/whitespace string, or empty array.
const isBlank = (v: unknown) =>
  v === undefined || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);

function answerSchemaFor(q: Question) {
  const value = valueSchemaFor(q);
  // Required must stay non-optional: an optional inner schema makes zod skip missing keys entirely.
  // The "Required" issue stops the pipe, so the value schema's type error never adds a second message.
  return z.preprocess((v, ctx) => {
    if (!isBlank(v)) return v;
    if (q.required) ctx.addIssue({ code: "custom", message: "Required" });
    return undefined;
  }, q.required ? value : value.optional());
}

// Validates a submission against a specific form (shared by the API and the public form page) and outputs
// exactly the stored `Answers` shape. Strict: answers for question ids that aren't in the form are rejected.
export function answersSchemaFor(form: FormDefinition) {
  return z
    .strictObject(Object.fromEntries(questionsOf(form).map((q) => [q.id, answerSchemaFor(q)])))
    .transform((parsed): Answers => {
      // unanswered optional questions come out as undefined; drop them so they're omitted, not stored as null
      const answered: Answers = {};
      for (const [id, value] of Object.entries(parsed)) if (value !== undefined) answered[id] = value;
      return answered;
    });
}
