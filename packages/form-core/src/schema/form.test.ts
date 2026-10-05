import { describe, expect, test } from "bun:test";
import { formDefinition, formDraft } from "./form";
import { blankBlocks, pagesOf, type BlockType } from "./blocks";

const paths = (r: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  r.error?.issues.map((i) => i.path.join(".")) ?? [];

describe("formDefinition", () => {
  test("fills defaults", () => {
    const form = formDefinition.parse({
      title: "x",
      blocks: [
        { id: "q", type: "short_text", title: "a" },
        { id: "m", type: "multiple_choice", title: "b", options: [{ id: "o", label: "1" }] },
      ],
    });
    expect(form.settings).toEqual({});
    expect(form.blocks[0]).toMatchObject({ required: false, maxLength: 1000 });
    expect(form.blocks[1]).toMatchObject({ required: false, allowMultiple: false });
  });

  test("rejects duplicate block and option ids", () => {
    const dup = formDraft.safeParse({
      title: "x",
      blocks: [
        { id: "q", type: "email", title: "a" },
        { id: "q", type: "multiple_choice", title: "b", options: [{ id: "o", label: "1" }, { id: "o", label: "2" }] },
      ],
    });
    expect(paths(dup)).toEqual(["blocks.1.id", "blocks.1.options.1.id"]);
  });

  test("rejects unknown question type", () => {
    expect(formDraft.safeParse({ title: "x", blocks: [{ id: "q", type: "rating", title: "a" }] }).success).toBe(false);
  });

  test("reports every publish issue with its path", () => {
    const draft = {
      title: " ",
      blocks: [
        { id: "a", type: "email", title: "" },
        { id: "b", type: "multiple_choice", title: "ok", options: [{ id: "o", label: "1" }, { id: "p", label: "" }] },
        { id: "c", type: "multiple_choice", title: "ok", options: [] },
      ],
    };
    expect(formDraft.safeParse(draft).success).toBe(true);
    expect(paths(formDefinition.safeParse(draft))).toEqual([
      "title",
      "blocks.0.title",
      "blocks.1.options.1.label",
      "blocks.2.options",
    ]);
    expect(paths(formDefinition.safeParse({ title: "x", blocks: [] }))).toEqual(["blocks"]);
  });

  test("every blank block is a valid draft", () => {
    const blocks = (Object.keys(blankBlocks) as BlockType[]).map((t, i) => blankBlocks[t](`b${i}`));
    expect(formDraft.safeParse({ title: "", blocks }).success).toBe(true);
  });
});

describe("page breaks", () => {
  const q = (id: string) => ({ id, type: "short_text", title: id });
  const br = (id: string) => ({ id, type: "page_break" });

  test("a page break parses and splits the form into pages", () => {
    const form = formDefinition.parse({ title: "x", blocks: [q("a"), q("b"), br("p"), q("c")] });
    expect(pagesOf(form).map((p) => p.map((q) => q.id))).toEqual([["a", "b"], ["c"]]);
  });

  test("pagesOf drops empty pages", () => {
    const draft = formDraft.parse({ title: "x", blocks: [br("p1"), q("a"), br("p2"), br("p3"), q("b"), br("p4")] });
    expect(pagesOf(draft).map((p) => p.map((q) => q.id))).toEqual([["a"], ["b"]]);
    expect(pagesOf(formDraft.parse({ title: "x", blocks: [] }))).toEqual([]);
  });

  test("an empty page is a publish issue on its break", () => {
    const issues = (blocks: unknown[]) => paths(formDefinition.safeParse({ title: "x", blocks }));
    expect(issues([br("p"), q("a")])).toEqual(["blocks.0"]);
    expect(issues([q("a"), br("p1"), br("p2"), q("b")])).toEqual(["blocks.2"]);
    expect(issues([q("a"), br("p")])).toEqual(["blocks.1"]);
  });
});
