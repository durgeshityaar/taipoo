import { z } from "zod";
import { publishChecks, question, type PublishIssue, type Question } from "./questions";

// What the editor saves: structure only, so empty titles, questions and options are fine.
export const formDraft = z
  .object({
    title: z.string().trim().max(200),
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

// TS can't correlate q.type with the lookup's parameter type, hence the cast; publishChecks' type guarantees the match.
const publishIssuesFor = (q: Question) => (publishChecks[q.type] as ((q: Question) => PublishIssue[]) | undefined)?.(q) ?? [];

// What gets published (and what versions hold): a draft that's ready for respondents. Same shape as a draft.
export const formDefinition = formDraft.superRefine((form, ctx) => {
  const issue = (path: PropertyKey[], message: string) => ctx.addIssue({ code: "custom", path, message });
  if (!form.title) issue(["title"], "Add a title");
  if (form.questions.length === 0) issue(["questions"], "Add at least one question");
  form.questions.forEach((q, i) => {
    if (!q.title) issue(["questions", i, "title"], "Required");
    for (const p of publishIssuesFor(q)) issue(["questions", i, ...p.path], p.message);
  });
});

export type FormDraft = z.infer<typeof formDraft>;
export type FormDefinition = z.infer<typeof formDefinition>;
