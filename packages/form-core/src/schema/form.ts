import { z } from "zod";
import { block, isQuestion, questionsOf } from "./blocks";
import { publishChecks, type PublishIssue, type Question } from "./questions";

// What the editor saves: structure only, so empty titles, questions, options and pages are fine.
export const formDraft = z
  .object({
    title: z.string().trim().max(200),
    description: z.string().max(2000).optional(),
    blocks: z.array(block).max(200),
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
    dupes(form.blocks, "block", (i) => ["blocks", i, "id"]);
    form.blocks.forEach((b, i) => {
      if (b.type === "multiple_choice") dupes(b.options, "option", (j) => ["blocks", i, "options", j, "id"]);
    });
  });

// TS can't correlate q.type with the lookup's parameter type, hence the cast; publishChecks' type guarantees the match.
const publishIssuesFor = (q: Question) => (publishChecks[q.type] as ((q: Question) => PublishIssue[]) | undefined)?.(q) ?? [];

// What gets published (and what versions hold): a draft that's ready for respondents. Same shape as a draft.
export const formDefinition = formDraft.superRefine((form, ctx) => {
  const issue = (path: PropertyKey[], message: string) => ctx.addIssue({ code: "custom", path, message });
  if (!form.title) issue(["title"], "Add a title");
  if (questionsOf(form).length === 0) issue(["blocks"], "Add at least one question");
  form.blocks.forEach((b, i) => {
    if (!isQuestion(b)) {
      // a break at the start, right after another break, or at the end leaves a page with no questions
      const prev = form.blocks[i - 1];
      if (!prev || prev.type === "page_break" || i === form.blocks.length - 1) issue(["blocks", i], "This page has no questions");
      return;
    }
    if (!b.title) issue(["blocks", i, "title"], "Required");
    for (const p of publishIssuesFor(b)) issue(["blocks", i, ...p.path], p.message);
  });
});

export type FormDraft = z.infer<typeof formDraft>;
export type FormDefinition = z.infer<typeof formDefinition>;
