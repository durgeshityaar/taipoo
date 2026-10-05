<script lang="ts">
	import OptionLetter from './option-letter.svelte';
	import type { EditorProps } from '.';

	let { editor, question, index }: EditorProps<'multiple_choice'> = $props();

	const issue = (path: string) => editor.issues[`blocks.${index}.${path}`];

	function onkeydown(e: KeyboardEvent & { currentTarget: HTMLInputElement }, j: number, optionId: string) {
		if (e.key === 'Enter' && !e.isComposing) {
			e.preventDefault();
			editor.addOption(question.id, j + 1);
		} else if (e.key === 'Backspace' && e.currentTarget.value === '' && question.options.length > 1) {
			e.preventDefault();
			editor.removeOption(question.id, optionId);
		}
	}
</script>

<!-- Options as chips sized to their text, lettered like the public form will show them. -->
<div class="flex flex-col items-start gap-2">
	{#each question.options as option, j (option.id)}
		<div>
			<label
				class="inline-flex h-9 items-center gap-2.5 rounded-md border border-input bg-card ps-2 pe-3 shadow-xs focus-within:border-ring"
			>
				<OptionLetter index={j} />
				<input
					value={option.label}
					oninput={(e) => editor.updateOption(question.id, option.id, e.currentTarget.value)}
					onkeydown={(e) => onkeydown(e, j, option.id)}
					{@attach editor.focusOn(option.id)}
					maxlength={200}
					placeholder={`Option ${j + 1}`}
					aria-label={`Option ${j + 1}`}
					aria-invalid={issue(`options.${j}.label`) ? true : undefined}
					class="field-sizing-content max-w-md min-w-12 bg-transparent text-body-md outline-none placeholder:text-faint"
				/>
			</label>
			{#if issue(`options.${j}.label`)}
				<p class="text-caption text-destructive">{issue(`options.${j}.label`)}</p>
			{/if}
		</div>
	{/each}
	<div>
		<button
			type="button"
			onclick={() => editor.addOption(question.id, question.options.length)}
			class="inline-flex h-9 items-center gap-2.5 rounded-md border border-border ps-2 pe-3 text-body-md text-muted-foreground outline-none hover:bg-hover focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<OptionLetter index={question.options.length} class="bg-faint" />
			Add option
		</button>
		{#if issue('options')}
			<p class="text-caption text-destructive">{issue('options')}</p>
		{/if}
	</div>
</div>
