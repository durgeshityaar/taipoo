import { describe, expect, test } from 'bun:test';
import { blankQuestions, type FormDraft } from '@taipoo/form-core';
import * as ops from './draft-ops';

const draft = (): FormDraft => ({
	title: '',
	questions: [blankQuestions.short_text('a'), blankQuestions.email('b'), blankQuestions.multiple_choice('m')],
	settings: {}
});
const ids = (d: FormDraft) => d.questions.map((q) => q.id);
const labels = (d: FormDraft) => {
	const q = d.questions.find((q) => q.id === 'm');
	return q?.type === 'multiple_choice' ? q.options.map((o) => o.label) : [];
};

describe('draft ops', () => {
	test('insert, update, remove', () => {
		const d = draft();
		ops.insert(d, 1, blankQuestions.long_text('l'));
		expect(ids(d)).toEqual(['a', 'l', 'b', 'm']);
		ops.update(d, 'l', { title: 'Bio', required: true });
		expect(d.questions[1]).toMatchObject({ title: 'Bio', required: true, type: 'long_text' });
		ops.remove(d, 'a');
		ops.remove(d, 'nope');
		expect(ids(d)).toEqual(['l', 'b', 'm']);
	});

	test('move stays in bounds', () => {
		const d = draft();
		ops.move(d, 'a', -1);
		ops.move(d, 'm', 1);
		expect(ids(d)).toEqual(['a', 'b', 'm']);
		ops.move(d, 'a', 1);
		ops.move(d, 'm', -1);
		expect(ids(d)).toEqual(['b', 'm', 'a']);
	});

	test('duplicate and reorder', () => {
		const d = draft();
		const copy = ops.duplicate(d, 'm')!;
		expect(ids(d)).toEqual(['a', 'b', 'm', copy]);
		const [orig, dup] = d.questions.slice(2) as { options: { id: string }[] }[];
		expect(dup!.options[0]!.id).not.toBe(orig!.options[0]!.id);
		ops.reorder(d, [copy, 'b', 'nope', 'a']);
		expect(ids(d)).toEqual([copy, 'b', 'a', 'm']);
	});

	test('options', () => {
		const d = draft();
		ops.updateOption(d, 'm', (d.questions[2] as { options: { id: string }[] }).options[0]!.id, 'Red');
		const blue = ops.addOption(d, 'm', 1)!;
		ops.updateOption(d, 'm', blue, 'Blue');
		ops.addOption(d, 'm', 1);
		expect(labels(d)).toEqual(['Red', '', 'Blue']);
		expect(ops.removeOption(d, 'm', blue)).toBe(d.questions[2]?.type === 'multiple_choice' ? d.questions[2].options[1]!.id : '');
		expect(labels(d)).toEqual(['Red', '']);
		expect(ops.addOption(d, 'a', 0)).toBeUndefined();
	});
});
