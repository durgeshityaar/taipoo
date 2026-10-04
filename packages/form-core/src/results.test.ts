import { describe, expect, test } from "bun:test";
import { formatAnswer, resultColumns } from "./results";
import { formDefinition } from "./schema";

const v1 = formDefinition.parse({
  title: "Survey",
  questions: [
    { id: "name", type: "short_text", title: "Name" },
    { id: "old", type: "email", title: "Email (removed later)" },
    { id: "plan", type: "multiple_choice", title: "Plan", options: [{ id: "a", label: "Free" }, { id: "b", label: "Pro" }] },
  ],
});
const v2 = formDefinition.parse({
  title: "Survey",
  questions: [
    { id: "plan", type: "multiple_choice", title: "Your plan", options: [{ id: "a", label: "Starter" }, { id: "b", label: "Pro" }] },
    { id: "name", type: "short_text", title: "Full name" },
    { id: "days", type: "multiple_choice", title: "Days", allowMultiple: true, options: [{ id: "d1", label: "Mon" }, { id: "d2", label: "Tue" }] },
  ],
});

describe("resultColumns", () => {
  test("newest version's order and titles, then deleted questions", () => {
    expect(resultColumns([v2, v1]).map((q) => q.title)).toEqual(["Your plan", "Full name", "Days", "Email (removed later)"]);
  });
});

describe("formatAnswer", () => {
  const question = (v: typeof v1, id: string) => v.questions.find((q) => q.id === id);

  test("option labels come from the response's own version", () => {
    expect(formatAnswer(question(v1, "plan"), "a")).toBe("Free");
    expect(formatAnswer(question(v2, "plan"), "a")).toBe("Starter");
  });

  test("multi-select joins labels; unknown ids show as-is", () => {
    expect(formatAnswer(question(v2, "days"), ["d1", "d2"])).toBe("Mon, Tue");
    expect(formatAnswer(question(v2, "days"), ["d1", "gone"])).toBe("Mon, gone");
  });

  test("text as-is, nothing answered is blank", () => {
    expect(formatAnswer(question(v1, "name"), "Ada, \"the\" first")).toBe('Ada, "the" first');
    expect(formatAnswer(question(v1, "name"), undefined)).toBe("");
    expect(formatAnswer(undefined, "x")).toBe("x");
  });
});
