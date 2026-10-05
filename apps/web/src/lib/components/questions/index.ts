import type { Question, QuestionType } from '@taipoo/form-core';
import AtSignIcon from '@lucide/svelte/icons/at-sign';
import CaseSensitiveIcon from '@lucide/svelte/icons/case-sensitive';
import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
import TextAlignStartIcon from '@lucide/svelte/icons/text-align-start';
import type { Component } from 'svelte';
import type { FormEditor } from '$lib/form-editor/form-editor.svelte';
import LongText from './long-text.svelte';
import MultipleChoiceField from './multiple-choice-field.svelte';
import MultipleChoiceSettings from './multiple-choice-settings.svelte';
import MultipleChoice from './multiple-choice.svelte';
import TextField from './text-field.svelte';

// Per question type: `Field`, how respondents answer it on the public form (/f/[slug]), and what its block in
// the form editor shows (question-block.svelte draws the shared chrome:
// gutter, title, the block menu with Required). `Editor` is what's under the title; without one, the block
// shows an empty answer box with the type's icon. `Settings` adds rows to the block menu (e.g. "Allow multiple").
//
// Adding a type (after adding it to packages/form-core/src/schema/questions):
//   1. add it to `questionKinds` below with its public `Field` (TypeScript errors until you do)
//   2. if the answer box isn't enough, a <type>.svelte taking EditorProps<'<type>'> as `Editor`;
//      type-specific switches in a <type>-settings.svelte as `Settings`

export type EditorProps<T extends QuestionType> = {
	editor: FormEditor;
	question: Extract<Question, { type: T }>;
	index: number; // position in the form, for looking up editor.issues ("blocks.<index>.…")
};

// An answer field on the public form. `id` goes on the focusable element (the page focuses the first
// invalid field on submit); the page renders the question title as `<id>-label` and the error under it.
// Generic over the question (not its type name) so one field component can serve several types.
export type FieldProps<Q extends Question> = {
	question: Q;
	value: string | string[] | undefined;
	id: string;
	invalid: boolean;
};

export const questionKinds: {
	[T in QuestionType]: {
		label: string;
		icon: Component<{ class?: string }>;
		Field: Component<FieldProps<Extract<Question, { type: T }>>, {}, 'value'>;
		Editor?: Component<EditorProps<T>>;
		Settings?: Component<EditorProps<T>>;
	};
} = {
	short_text: { label: 'Short answer', icon: CaseSensitiveIcon, Field: TextField },
	long_text: { label: 'Long answer', icon: TextAlignStartIcon, Field: TextField, Editor: LongText },
	email: { label: 'Email', icon: AtSignIcon, Field: TextField },
	multiple_choice: {
		label: 'Multiple choice',
		icon: CircleCheckIcon,
		Field: MultipleChoiceField,
		Editor: MultipleChoice,
		Settings: MultipleChoiceSettings,
	},
};
