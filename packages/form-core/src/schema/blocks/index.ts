import { z } from "zod";
import type { FormDraft } from "../form";
import { blankQuestions, question, type Question } from "../questions";
import { blankPageBreak, pageBreak } from "./page-break";

// A form is a list of blocks: questions (see questions/index.ts) and layout blocks, which shape the form but
// collect no answers. Layout blocks are positional (a page break splits the list where it sits).
//
// Adding a layout block:
//   1. create blocks/<type>.ts exporting `<type>` (schema), `<Type>`, `blank<Type>`
//   2. add the schema to `block` and its blank to `blankBlocks` below; re-export the file at the bottom
//   3. render it in the editor (apps/web/src/routes/(app)/forms/[id]/edit/+page.svelte), add it to the
//      "Layout blocks" group in question-type-items.svelte, and render it in form-view.svelte

export const block = z.discriminatedUnion("type", [...question.options, pageBreak]);

export type Block = z.infer<typeof block>;
export type BlockType = Block["type"];
type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;

export const blankBlocks: { [T in BlockType]: (id: string) => BlockOf<T> } = {
  ...blankQuestions,
  page_break: blankPageBreak,
};

export const isQuestion = (b: Block): b is Question => Object.hasOwn(blankQuestions, b.type);

export const questionsOf = (form: Pick<FormDraft, "blocks">): Question[] => form.blocks.filter(isQuestion);

// The questions on each page, in order. Empty pages are dropped, so a draft with stray breaks still previews.
export function pagesOf(form: Pick<FormDraft, "blocks">): Question[][] {
  const pages: Question[][] = [[]];
  for (const b of form.blocks) {
    if (isQuestion(b)) pages.at(-1)!.push(b);
    else if (b.type === "page_break") pages.push([]);
  }
  return pages.filter((p) => p.length > 0);
}

export * from "./page-break";
