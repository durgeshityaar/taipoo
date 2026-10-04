<script lang="ts">
	import type { EmailQuestion, LongTextQuestion, ShortTextQuestion } from '@taipoo/form-core';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { FieldProps } from '.';

	// The public form's answer field for short text, long text and email.
	let { question, value = $bindable(), id, invalid }: FieldProps<ShortTextQuestion | LongTextQuestion | EmailQuestion> = $props();

	// Same look as the editor's answer box, at the public form's 44px touch size.
	const box = 'rounded-md px-3.5 shadow-xs';
</script>

{#if question.type === 'long_text'}
	<Textarea
		{id}
		bind:value={value as string | undefined}
		maxlength={question.maxLength}
		aria-labelledby="{id}-label"
		aria-required={question.required}
		aria-invalid={invalid || undefined}
		class="{box} min-h-28 py-2.5"
	/>
{:else}
	<Input
		{id}
		bind:value={value as string | undefined}
		type={question.type === 'email' ? 'email' : 'text'}
		autocomplete={question.type === 'email' ? 'email' : undefined}
		maxlength={question.type === 'short_text' ? question.maxLength : undefined}
		aria-labelledby="{id}-label"
		aria-required={question.required}
		aria-invalid={invalid || undefined}
		class="{box} h-11"
	/>
{/if}
