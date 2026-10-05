import { questionsOf, type FormDefinition, type Question } from "./schema";

// Responses are answered against the version they were submitted to, and questions can be renamed or deleted
// (and options relabeled) after that. These turn stored answers into what owners read, the same way for the
// results table and the CSV export.

// Columns for a form's results: the newest version's questions in order, then questions that only older versions
// had (deleted since), so their answers still show. `versions` is newest first; titles come from the newest one.
export function resultColumns(versions: FormDefinition[]): Question[] {
  const columns = new Map<string, Question>();
  for (const version of versions) for (const q of questionsOf(version)) if (!columns.has(q.id)) columns.set(q.id, q);
  return [...columns.values()];
}

// A version's questions by id, for reading many answers against it. Build once per version, not per cell.
export const questionsById = (version: FormDefinition) => new Map(questionsOf(version).map((q) => [q.id, q]));

// An answer as text. Pass the question from the response's own version, so option ids map to the labels the
// respondent actually saw. Unknown ids show as-is; nothing answered is "".
export function formatAnswer(question: Question | undefined, value: string | string[] | undefined): string {
  if (value === undefined) return "";
  const values = Array.isArray(value) ? value : [value];
  if (question?.type !== "multiple_choice") return values.join(", ");
  return values.map((id) => question.options.find((o) => o.id === id)?.label ?? id).join(", ");
}
