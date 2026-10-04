<script lang="ts">
	import type { Question, QuestionType } from '@taipoo/form-core';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import AsteriskIcon from '@lucide/svelte/icons/asterisk';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import type { Component } from 'svelte';
	import { dragHandle } from 'svelte-dnd-action';
	import { Command as CommandPrimitive } from 'bits-ui';
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import type { FormEditor } from '$lib/form-editor/form-editor.svelte';
	import { cn } from '$lib/utils';
	import AnswerBox from './answer-box.svelte';
	import InsertLine from './insert-line.svelte';
	import QuestionTypeItems from './question-type-items.svelte';
	import { questionKinds, type EditorProps } from '.';

	let { editor, question, index }: { editor: FormEditor; question: Question; index: number } = $props();

	const kind = $derived(questionKinds[question.type]);
	// TS can't correlate question.type with the looked-up components' props; questionKinds' type guarantees the match.
	const Editor = $derived(kind.Editor as Component<EditorProps<QuestionType>> | undefined);
	const Settings = $derived(kind.Settings as Component<EditorProps<QuestionType>> | undefined);
	const first = $derived(index === 0);
	const last = $derived(index === editor.draft.questions.length - 1);
	const titleIssue = $derived(editor.issues[`questions.${index}.title`]);
	const requiredId = $derived(`required-${question.id}`);
	const mod = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl+';

	let menuOpen = $state(false);
	let addOpen = $state(false);

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.isComposing) {
			e.preventDefault();
			editor.insertAt = index + 1; // open an insert line under this block
		} else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
			e.preventDefault();
			editor.move(question.id, e.key === 'ArrowUp' ? -1 : 1);
		} else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
			e.preventDefault(); // not the browser's bookmark
			editor.duplicate(question.id);
		}
	}

	// Menu actions close the menu first, so focus can move to wherever the action puts it.
	const act = (fn: () => void) => () => {
		menuOpen = false;
		fn();
	};
</script>

{#snippet action(icon: Component<{ class?: string }>, label: string, hint: string, onclick: () => void, opts: { disabled?: boolean; destructive?: boolean } = {})}
	{@const Icon = icon}
	<button
		type="button"
		disabled={opts.disabled}
		onclick={act(onclick)}
		class={cn(
			'flex h-8 w-full items-center gap-2 rounded-sm px-2 text-body-sm outline-none hover:bg-hover focus-visible:bg-hover disabled:pointer-events-none disabled:opacity-50',
			opts.destructive && 'text-destructive'
		)}
	>
		<Icon class="size-4 shrink-0" />
		<span class="flex-1 text-left">{label}</span>
		<span class="text-caption text-muted-foreground">{hint}</span>
	</button>
{/snippet}

<div>
	<section class="group relative flex flex-col gap-2.5" aria-label={question.title || `Question ${index + 1}`}>
		<div class="flex items-center gap-1.5">
			<!-- Gutter: hangs in the left margin, centred on the title line; shown on hover (always on touch screens). -->
			<div
				class="absolute top-0.5 right-full flex items-center pr-2 text-muted-foreground opacity-0 group-hover:opacity-100 has-focus-visible:opacity-100 has-data-[state=open]:opacity-100 pointer-coarse:opacity-100"
			>
				<Button variant="ghost" size="icon-xs" aria-label="Delete question" onclick={() => editor.remove(question.id)}>
					<TrashIcon class="size-4" />
				</Button>
				<!-- Opens the question types right here; the pick goes in below this block. -->
				<Popover.Root bind:open={addOpen}>
					<Popover.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon-xs" aria-label="Insert a question below">
								<PlusIcon class="size-4" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<!-- No focus trap: picking a type moves the cursor into the new block while this closes. -->
					<Popover.Content align="start" class="w-72 gap-0 p-1" trapFocus={false} onCloseAutoFocus={(e) => e.preventDefault()}>
						<Command.Root class="bg-transparent p-0">
							<CommandPrimitive.Input
								placeholder="Search question types"
								aria-label="Search question types"
								class="h-8 w-full bg-transparent px-2 text-body-sm outline-none placeholder:text-faint"
							/>
							<QuestionTypeItems
								onpick={(type) => {
									addOpen = false;
									editor.insert(index + 1, type);
								}}
							/>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
				<Popover.Root bind:open={menuOpen}>
					<Popover.Trigger>
						{#snippet child({ props })}
							<!-- Click opens the block menu; dragging reorders (svelte-dnd-action handle). -->
							<button
								{...props}
								use:dragHandle
								aria-label="Drag to move, click for options"
								class="inline-flex size-6 cursor-grab items-center justify-center rounded-md outline-none hover:bg-hover focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
							>
								<GripVerticalIcon class="size-4" />
							</button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content align="start" side="bottom" class="w-72 gap-0 p-0">
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
						<Separator />
						<div class="flex flex-col p-1">
							{@render action(TrashIcon, 'Delete', 'Del', () => editor.remove(question.id), { destructive: true })}
							{@render action(CopyIcon, 'Duplicate', `${mod}D`, () => editor.duplicate(question.id))}
							{@render action(ArrowUpIcon, 'Move up', '⌥↑', () => editor.move(question.id, -1), { disabled: first })}
							{@render action(ArrowDownIcon, 'Move down', '⌥↓', () => editor.move(question.id, 1), { disabled: last })}
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>

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
	{#if editor.insertAt === index + 1 && !last}
		<div class="pt-8"><InsertLine {editor} at={index + 1} /></div>
	{/if}
</div>
