import { describe, expect, test } from "bun:test";
import { formDefinition, formDraft } from "./form";
import { blankQuestions, type QuestionType } from "./questions";

const paths = (r: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  r.error?.issues.map((i) => i.path.join(".")) ?? [];

describe("formDefinition", () => {
  test("fills defaults", () => {
    const form = formDefinition.parse({
      title: "x",
      questions: [
        { id: "q", type: "short_text", title: "a" },
        { id: "m", type: "multiple_choice", title: "b", options: [{ id: "o", label: "1" }] },
      ],
    });
    expect(form.settings).toEqual({});
    expect(form.questions[0]).toMatchObject({ required: false, maxLength: 1000 });
    expect(form.questions[1]).toMatchObject({ required: false, allowMultiple: false });
  });

  test("rejects duplicate question and option ids", () => {
    const dup = formDraft.safeParse({
      title: "x",
      questions: [
        { id: "q", type: "email", title: "a" },
        { id: "q", type: "multiple_choice", title: "b", options: [{ id: "o", label: "1" }, { id: "o", label: "2" }] },
      ],
    });
    expect(paths(dup)).toEqual(["questions.1.id", "questions.1.options.1.id"]);
  });

  test("rejects unknown question type", () => {
    expect(formDraft.safeParse({ title: "x", questions: [{ id: "q", type: "rating", title: "a" }] }).success).toBe(false);
  });

  test("reports every publish issue with its path", () => {
    const draft = {
      title: " ",
      questions: [
        { id: "a", type: "email", title: "" },
        { id: "b", type: "multiple_choice", title: "ok", options: [{ id: "o", label: "1" }, { id: "p", label: "" }] },
        { id: "c", type: "multiple_choice", title: "ok", options: [] },
      ],
    };
    expect(formDraft.safeParse(draft).success).toBe(true);
    expect(paths(formDefinition.safeParse(draft))).toEqual([
      "title",
      "questions.0.title",
      "questions.1.options.1.label",
      "questions.2.options",
    ]);
    expect(paths(formDefinition.safeParse({ title: "x", questions: [] }))).toEqual(["questions"]);
  });

  test("every blank question is a valid draft", () => {
    const questions = (Object.keys(blankQuestions) as QuestionType[]).map((t, i) => blankQuestions[t](`q${i}`));
    expect(formDraft.safeParse({ title: "", questions }).success).toBe(true);
  });
});
