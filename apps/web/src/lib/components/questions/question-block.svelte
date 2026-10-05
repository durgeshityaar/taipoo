<script lang="ts">
	import type { Question, QuestionType } from '@taipoo/form-core';
	import AsteriskIcon from '@lucide/svelte/icons/asterisk';
	import type { Component } from 'svelte';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import type { FormEditor } from '$lib/form-editor/form-editor.svelte';
	import AnswerBox from './answer-box.svelte';
	import BlockGutter, { blockKeydown } from './block-gutter.svelte';
	import { questionKinds, type EditorProps } from '.';

	let { editor, question, index }: { editor: FormEditor; question: Question; index: number } = $props();

	const kind = $derived(questionKinds[question.type]);
	// TS can't correlate question.type with the looked-up components' props; questionKinds' type guarantees the match.
	const Editor = $derived(kind.Editor as Component<EditorProps<QuestionType>> | undefined);
	const Settings = $derived(kind.Settings as Component<EditorProps<QuestionType>> | undefined);
	const titleIssue = $derived(editor.issues[`blocks.${index}.title`]);
	const requiredId = $derived(`required-${question.id}`);
	const onkeydown = $derived(blockKeydown(editor, question.id, index));
</script>

<section class="group relative flex flex-col gap-2.5" aria-label={question.title || `Question ${index + 1}`}>
	<div class="flex items-center gap-1.5">
		<!-- Gutter: hangs in the left margin, centred on the title line. -->
		<BlockGutter {editor} id={question.id} {index} what="question">
			{#snippet menu()}
				<div class="flex items-center gap-2 px-3 py-2.5">
					<kind.icon class="size-4 shrink-0 text-muted-foreground" />
					<span class="truncate text-title-sm">{question.title || `Untitled ${kind.label.toLowerCase()} field`}</span>
				</div>
				<Separator />
				<div class="flex flex-col gap-3 px-3 py-3">
					<div class="flex items-center justify-between gap-4">
						<Label for={requiredId} class="text-body-sm font-normal">Required</Label>
						<Switch
							id={requiredId}
							checked={question.required}
							onCheckedChange={(required) => editor.update(question.id, { required })}
						/>
					</div>
					{#if Settings}<Settings {editor} {question} {index} />{/if}
				</div>
			{/snippet}
		</BlockGutter>

		<input
			value={question.title}
			oninput={(e) => editor.update(question.id, { title: e.currentTarget.value })}
			{onkeydown}
			{@attach editor.focusOn(question.id)}
			maxlength={500}
			placeholder="Type a question"
			aria-label="Question"
			aria-invalid={titleIssue ? true : undefined}
			class="field-sizing-content h-7 max-w-full bg-transparent text-title outline-none placeholder:text-faint"
		/>
		{#if question.required}
			<button
				type="button"
				onclick={() => editor.update(question.id, { required: false })}
				aria-label="Required (click to make optional)"
				title="Required"
				class="inline-flex size-4.5 shrink-0 items-center justify-center rounded-full bg-hover text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
			>
				<AsteriskIcon class="size-3" />
			</button>
		{/if}
	</div>
	{#if titleIssue}<p class="-mt-1.5 text-caption text-destructive">{titleIssue}</p>{/if}
	{#if Editor}<Editor {editor} {question} {index} />{:else}<AnswerBox icon={kind.icon} />{/if}
</section>
