<script lang="ts">
	import type { EditorProps } from '.';

	let { editor, question, index }: EditorProps<'multiple_choice'> = $props();

	const issue = (path: string) => editor.issues[`questions.${index}.${path}`];
	// A, B, … Z, then numbers (a question can have up to 100 options).
	const letter = (j: number) => (j < 26 ? String.fromCharCode(65 + j) : String(j + 1));

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

{#snippet badge(j: number, faint = false)}
	<span
		class="inline-flex size-5 shrink-0 items-center justify-center rounded-xs text-eyebrow text-card {faint
			? 'bg-faint'
			: 'bg-muted-foreground'}"
	>
		{letter(j)}
	</span>
{/snippet}

<!-- Options as chips sized to their text, lettered like the public form will show them. -->
<div class="flex flex-col items-start gap-2">
	{#each question.options as option, j (option.id)}
		<div>
			<label
				class="inline-flex h-9 items-center gap-2.5 rounded-md border border-input bg-card ps-2 pe-3 shadow-xs focus-within:border-ring"
			>
				{@render badge(j)}
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
			{@render badge(question.options.length, true)}
			Add option
		</button>
		{#if issue('options')}
			<p class="text-caption text-destructive">{issue('options')}</p>
		{/if}
	</div>
</div>
