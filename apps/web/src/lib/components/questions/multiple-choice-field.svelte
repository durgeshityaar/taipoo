<script lang="ts">
	import type { MultipleChoiceQuestion } from '@taipoo/form-core';
	import OptionLetter from './option-letter.svelte';
	import type { FieldProps } from '.';

	// The public form's options: the editor's lettered chips, selectable. Each chip wraps a visually hidden
	// native radio/checkbox, so keyboard use and screen readers work like any radio group or checkbox list.
	let { question, value = $bindable(), id, invalid }: FieldProps<MultipleChoiceQuestion> = $props();

	const type = $derived(question.allowMultiple ? 'checkbox' : 'radio');
	const selected = $derived(Array.isArray(value) ? value : value ? [value] : []);

	function toggle(optionId: string, checked: boolean) {
		if (question.allowMultiple) value = checked ? [...selected, optionId] : selected.filter((o) => o !== optionId);
		else value = optionId;
	}
</script>

<div
	role={question.allowMultiple ? 'group' : 'radiogroup'}
	aria-labelledby="{id}-label"
	aria-required={question.required}
	aria-invalid={invalid || undefined}
	class="flex flex-col items-start gap-2"
>
	{#each question.options as option, j (option.id)}
		<label
			class="inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md border border-input bg-card ps-2.5 pe-4 shadow-xs hover:bg-hover has-checked:border-primary has-checked:ring-1 has-checked:ring-primary has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
		>
			<input
				id={j === 0 ? id : undefined}
				{type}
				name={question.id}
				value={option.id}
				checked={selected.includes(option.id)}
				onchange={(e) => toggle(option.id, e.currentTarget.checked)}
				class="peer sr-only"
			/>
			<OptionLetter index={j} class="peer-checked:bg-primary" />
			<span class="text-body-md">{option.label}</span>
		</label>
	{/each}
</div>
