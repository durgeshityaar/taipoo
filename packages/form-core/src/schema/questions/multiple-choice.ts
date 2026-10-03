import { z } from "zod";
import { id, questionBase } from "./base";

export const multipleChoiceQuestion = z.object({
  ...questionBase,
  type: z.literal("multiple_choice"),
  options: z.array(z.object({ id, label: z.string().trim().min(1).max(200) })).min(1).max(100),
  allowMultiple: z.boolean().default(false),
});

export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestion>;

// Answer is an option id, or a list of distinct option ids when allowMultiple.
export const multipleChoiceAnswer = (q: MultipleChoiceQuestion) => {
  const choice = z.enum(q.options.map((o) => o.id));
  return q.allowMultiple ? z.array(choice).refine((a) => new Set(a).size === a.length, "Duplicate choices") : choice;
};
