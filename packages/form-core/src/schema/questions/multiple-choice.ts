import { z } from "zod";
import { id, newId, questionBase, type PublishIssue } from "./base";

export const multipleChoiceQuestion = z.object({
  ...questionBase,
  type: z.literal("multiple_choice"),
  // Empty options and labels are fine in a draft; multipleChoicePublishIssues blocks publishing them.
  options: z.array(z.object({ id, label: z.string().trim().max(200) })).max(100),
  allowMultiple: z.boolean().default(false),
});

export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestion>;

export const blankMultipleChoice = (id: string) =>
  multipleChoiceQuestion.parse({ id, type: "multiple_choice", title: "", options: [{ id: newId(), label: "" }] });

export const multipleChoicePublishIssues = (q: MultipleChoiceQuestion): PublishIssue[] =>
  q.options.length === 0
    ? [{ path: ["options"], message: "Add at least one option" }]
    : q.options.flatMap((o, j) => (o.label ? [] : [{ path: ["options", j, "label"], message: "Required" }]));

// Answer is an option id, or a list of distinct option ids when allowMultiple.
export const multipleChoiceAnswer = (q: MultipleChoiceQuestion) => {
  const choice = z.enum(q.options.map((o) => o.id));
  return q.allowMultiple ? z.array(choice).refine((a) => new Set(a).size === a.length, "Duplicate choices") : choice;
};
