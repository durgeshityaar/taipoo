import { describe, expect, test } from "bun:test";
import { answersSchemaFor } from "./answers";
import { formDefinition } from "./form";

const form = formDefinition.parse({
  title: "Signup",
  questions: [
    { id: "name", type: "short_text", title: "Your name", required: true },
    { id: "bio", type: "long_text", title: "About you" },
    { id: "email", type: "email", title: "Email", required: true },
    {
      id: "plan",
      type: "multiple_choice",
      title: "Plan",
      required: true,
      options: [
        { id: "free", label: "Free" },
        { id: "pro", label: "Pro" },
      ],
    },
    {
      id: "topics",
      type: "multiple_choice",
      title: "Topics",
      allowMultiple: true,
      options: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
    },
  ],
});
const answers = answersSchemaFor(form);
const valid = { name: "Ada", email: "ada@example.com", plan: "pro" };

describe("answersSchemaFor", () => {
  test("accepts required answers, optional ones omitted", () => {
    expect(answers.safeParse(valid).success).toBe(true);
  });

  test("accepts optional answers when given", () => {
    expect(answers.safeParse({ ...valid, bio: "hi", topics: ["a", "b"] }).success).toBe(true);
  });

  test("rejects missing or blank required answers", () => {
    expect(answers.safeParse({ email: "ada@example.com", plan: "pro" }).success).toBe(false);
    expect(answers.safeParse({ ...valid, name: "   " }).success).toBe(false);
  });

  test("rejects bad email, unknown option, duplicate choices", () => {
    expect(answers.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(answers.safeParse({ ...valid, plan: "enterprise" }).success).toBe(false);
    expect(answers.safeParse({ ...valid, topics: ["a", "a"] }).success).toBe(false);
  });

  test("treats blank optional answers as unanswered and drops them", () => {
    const r = answers.safeParse({ ...valid, bio: "  ", topics: [] });
    expect(r.success && r.data).toEqual(valid);
  });

  test("reports a single 'Required' per missing or blank required answer", () => {
    const r = answers.safeParse({ plan: "" });
    expect(r.error!.issues.map((i) => `${i.path.join(".")}: ${i.message}`)).toEqual([
      "name: Required",
      "email: Required",
      "plan: Required",
    ]);
  });

  test("rejects answers for questions not in the form", () => {
    expect(answers.safeParse({ ...valid, injected: "x" }).success).toBe(false);
  });
});
