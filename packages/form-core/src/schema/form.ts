import { z } from "zod";
import { question } from "./questions";

export const formDefinition = z
  .object({
    title: z.string().trim().max(200), // empty while drafting; publishing requires one
    description: z.string().max(2000).optional(),
    questions: z.array(question).max(200),
    settings: z.object({ thankYouMessage: z.string().max(2000).optional() }).default({}),
  })
  .superRefine((form, ctx) => {
    const dupes = (items: { id: string }[], what: string, path: (i: number) => PropertyKey[]) => {
      const seen = new Set<string>();
      items.forEach((it, i) => {
        if (seen.has(it.id)) ctx.addIssue({ code: "custom", message: `Duplicate ${what} id "${it.id}"`, path: path(i) });
        seen.add(it.id);
      });
    };
    dupes(form.questions, "question", (i) => ["questions", i, "id"]);
    form.questions.forEach((q, i) => {
      if (q.type === "multiple_choice") dupes(q.options, "option", (j) => ["questions", i, "options", j, "id"]);
    });
  });

export type FormDefinition = z.infer<typeof formDefinition>;
