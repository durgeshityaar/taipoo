import { describe, expect, test } from "bun:test";
import { formDefinition } from "./form";

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
    const dup = formDefinition.safeParse({
      title: "x",
      questions: [
        { id: "q", type: "email", title: "a" },
        { id: "q", type: "multiple_choice", title: "b", options: [{ id: "o", label: "1" }, { id: "o", label: "2" }] },
      ],
    });
    expect(dup.success).toBe(false);
    expect(dup.error!.issues.map((i) => i.path.join("."))).toEqual(["questions.1.id", "questions.1.options.1.id"]);
  });

  test("rejects unknown question type", () => {
    expect(formDefinition.safeParse({ title: "x", questions: [{ id: "q", type: "rating", title: "a" }] }).success).toBe(false);
  });
});
