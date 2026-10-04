import { newId, type FormDraft, type Question } from '@taipoo/form-core';

// Edits to a draft, in place (so they work on a $state proxy and on plain objects in tests).
// Unknown ids and out-of-range moves are no-ops.

// Any of a question's own fields, for whichever type it is (Omit isn't distributive, hence the conditional).
export type QuestionPatch = Question extends infer Q ? (Q extends Question ? Partial<Omit<Q, 'id' | 'type'>> : never) : never;

const find = (d: FormDraft, id: string) => d.questions.find((q) => q.id === id);
const options = (d: FormDraft, id: string) => {
	const q = find(d, id);
	return q?.type === 'multiple_choice' ? q.options : [];
};

export function insert(d: FormDraft, at: number, q: Question) {
	d.questions.splice(at, 0, q);
}

export function update(d: FormDraft, id: string, patch: QuestionPatch) {
	const q = find(d, id);
	if (q) Object.assign(q, patch);
}

export function remove(d: FormDraft, id: string) {
	const i = d.questions.findIndex((q) => q.id === id);
	if (i !== -1) d.questions.splice(i, 1);
}

// Copies a question (fresh ids for it and its options) right below it. Returns the copy's id.
export function duplicate(d: FormDraft, id: string) {
	const i = d.questions.findIndex((q) => q.id === id);
	if (i === -1) return;
	const copy = structuredClone(d.questions[i]!);
	copy.id = newId();
	if (copy.type === 'multiple_choice') for (const o of copy.options) o.id = newId();
	d.questions.splice(i + 1, 0, copy);
	return copy.id;
}

// Puts questions in the order of `ids` (after a drag); unknown ids are ignored, unlisted questions keep their place at the end.
export function reorder(d: FormDraft, ids: string[]) {
	const rank = new Map(ids.map((id, i) => [id, i]));
	d.questions.sort((a, b) => (rank.get(a.id) ?? ids.length) - (rank.get(b.id) ?? ids.length));
}

export function move(d: FormDraft, id: string, by: -1 | 1) {
	const i = d.questions.findIndex((q) => q.id === id);
	const j = i + by;
	if (i === -1 || j < 0 || j >= d.questions.length) return;
	[d.questions[i], d.questions[j]] = [d.questions[j]!, d.questions[i]!];
}

// Returns the new option's id, or undefined if the question isn't multiple choice.
export function addOption(d: FormDraft, questionId: string, at: number) {
	const q = find(d, questionId);
	if (q?.type !== 'multiple_choice') return;
	const option = { id: newId(), label: '' };
	q.options.splice(at, 0, option);
	return option.id;
}

export function updateOption(d: FormDraft, questionId: string, optionId: string, label: string) {
	const o = options(d, questionId).find((o) => o.id === optionId);
	if (o) o.label = label;
}

// Returns the id of the option to focus next: the one above, as when deleting an empty line in a document.
export function removeOption(d: FormDraft, questionId: string, optionId: string) {
	const list = options(d, questionId);
	const i = list.findIndex((o) => o.id === optionId);
	if (i === -1) return;
	list.splice(i, 1);
	return list[Math.max(i - 1, 0)]?.id;
}
