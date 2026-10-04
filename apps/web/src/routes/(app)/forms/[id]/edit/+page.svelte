<script lang="ts">
	import type { Question } from '@taipoo/form-core';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { untrack } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { flip } from 'svelte/animate';
	import { dragHandleZone, setKeyboardDragTrigger, type DndEvent } from 'svelte-dnd-action';
	import InsertLine from '$lib/components/questions/insert-line.svelte';
	import QuestionBlock from '$lib/components/questions/question-block.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import FormView from '$lib/components/form-view/form-view.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import { FormEditor } from '$lib/form-editor/form-editor.svelte';
	import { pageHeader } from '$lib/page-header.svelte';
	import { formTitle, workspace } from '$lib/workspace';

	let { data } = $props();

	// One editor per form: opening another form starts a new one; reloading the same form keeps your edits.
	const formId = $derived(data.form.id);
	const editor = $derived.by(() => {
		formId; // the only dependency
		return untrack(() => new FormEditor(data.form));
	});

	// Leaving the editor, or switching forms, mid-debounce still saves.
	$effect(() => {
		const current = editor;
		return () => void current.flush();
	});

	$effect(() => {
		pageHeader.crumbs = [workspace.name, formTitle(editor.draft.title)];
		pageHeader.actions = actions;
		return () => {
			pageHeader.crumbs = undefined;
			pageHeader.actions = undefined;
		};
	});

	// Drag to reorder (the ⠿ handle in each block). Mid-drag the list holds the library's placeholder item,
	// so it lives here and only the drop touches the draft (one save).
	// ponytail: no keyboard dragging; Space/Enter on ⠿ open its menu, and Alt+↑/↓ or Move up/down reorder.
	setKeyboardDragTrigger(null);
	const flipDurationMs = 150;
	let dragItems = $state<Question[] | null>(null);
	const items = $derived(dragItems ?? editor.draft.questions);

	function onconsider(e: CustomEvent<DndEvent<Question>>) {
		dragItems = e.detail.items;
	}

	function onfinalize(e: CustomEvent<DndEvent<Question>>) {
		editor.reorder(e.detail.items.map((q) => q.id));
		dragItems = null;
	}

	// Preview: the draft as respondents would see it, full screen. Submitting validates but saves nothing.
	let previewing = $state(false);

	// New forms open with the cursor in the title, ready to type. After navigating, since SvelteKit
	// resets focus to <body> once a navigation completes.
	let titleInput = $state<HTMLInputElement>();
	afterNavigate(() => {
		if (!editor.draft.title) titleInput?.focus();
	});
</script>

{#snippet actions()}
	<!-- Tally-style: quiet text status, one compact primary action. -->
	{#if editor.hasChanges}
		<Badge variant="info" title="The live form doesn't have your latest edits yet. Publish to update it.">Changes</Badge>
	{/if}
	<span class="text-caption text-muted-foreground" aria-live="polite">
		{#if editor.saveStatus !== 'idle'}
			{editor.saveStatus === 'saving' ? 'Saving…' : editor.saveStatus === 'saved' ? 'Saved' : 'Not saved'} ·
		{/if}
		<span class={editor.live ? 'font-medium text-success' : ''}>{editor.live ? 'Live' : 'Draft'}</span>
	</span>
	{#if editor.live}
		<a
			href={editor.publicUrl}
			target="_blank"
			rel="noopener"
			class="ms-2 text-caption font-semibold text-muted-foreground hover:text-foreground">Open form ↗</a
		>
	{/if}
	<button
		type="button"
		onclick={() => (previewing = true)}
		class="ms-2 text-caption font-semibold text-muted-foreground hover:text-foreground">Preview</button
	>
	<Button size="sm" class="ms-2 h-7 px-3" onclick={() => editor.publish()} disabled={editor.publishing}>Publish</Button>
{/snippet}

<!-- Enter with nothing focused starts writing at the end of the form, like a document. -->
<svelte:window
	onkeydown={(e) => {
		if (previewing) {
			if (e.key === 'Escape') previewing = false;
		} else if (e.key === 'Enter' && document.activeElement === document.body) {
			e.preventDefault();
			editor.insertAt = items.length;
		}
	}}
/>

<svelte:head><title>{formTitle(editor.draft.title)} · Taipoo</title></svelte:head>

<!-- Each block's gutter (🗑 + ⠿) hangs in the left margin; when the area is too narrow for that margin, the column makes room for it. -->
<div class="@container w-full">
<div class="mx-auto w-full max-w-2xl pt-16 pr-4 pl-20 md:pt-24 @4xl:pl-4">
	<input
		value={editor.draft.title}
		oninput={(e) => editor.setTitle(e.currentTarget.value)}
		onkeydown={(e) => {
			if (e.key === 'Enter' && !e.isComposing) {
				e.preventDefault();
				editor.insertAt = 0;
			}
		}}
		bind:this={titleInput}
		maxlength={200}
		placeholder="Form title"
		aria-label="Form title"
		aria-invalid={editor.issues.title ? true : undefined}
		class="w-full bg-transparent text-heading-1 outline-none placeholder:text-faint"
	/>
	{#if editor.issues.title}<p class="mt-1 text-caption text-destructive">{editor.issues.title}</p>{/if}

	<div class="mt-10 flex flex-col gap-8">
		{#if items.length > 0}
			{#if editor.insertAt === 0}<InsertLine {editor} at={0} />{/if}
			<!-- Each child is one item for the drag library; a block renders the insert line under it itself. -->
			<div
				use:dragHandleZone={{ items, flipDurationMs, dropTargetStyle: {} }}
				{onconsider}
				{onfinalize}
				class="flex flex-col gap-8"
			>
				{#each items as question, index (question.id)}
					<div animate:flip={{ duration: flipDurationMs }}>
						<QuestionBlock {editor} {question} {index} />
					</div>
				{/each}
			</div>
		{/if}
		<!-- The last line: always there on an empty form; otherwise only once opened (Enter on the last
		     question, Enter on the page, or a click below Submit), so it doesn't push Submit down. -->
		{#if items.length === 0 || editor.insertAt === items.length}
			<div>
				<InsertLine {editor} at={items.length} idle={items.length === 0 ? 'Press Enter to start from scratch' : ''} />
				{#if editor.issues.questions}<p class="mt-1 text-caption text-destructive">{editor.issues.questions}</p>{/if}
			</div>
		{/if}
		<!-- What respondents will see at the end of the form; not a control here. -->
		<div aria-hidden="true">
			<Button shape="pill" size="lg" tabindex={-1} class="pointer-events-none">Submit <ArrowRightIcon /></Button>
		</div>
	</div>
	<!-- Clicking the empty space below the form adds a question at the end, as in a document.
	     Keyboard users get the same with Enter on the last question. -->
	<button
		type="button"
		tabindex="-1"
		aria-hidden="true"
		onclick={() => (editor.insertAt = items.length)}
		class="block h-32 w-full cursor-text"
	></button>
</div>
</div>

{#if previewing}
	<div class="fixed inset-0 z-50 overflow-y-auto bg-background" role="dialog" aria-modal="true" aria-label="Preview">
		<div class="sticky top-0 z-10 flex h-14 items-center gap-3 bg-background px-4">
			<Button variant="outline" size="sm" onclick={() => (previewing = false)}>
				<ArrowLeftIcon /> Back to editor
			</Button>
			<span class="ms-auto text-caption text-muted-foreground">Preview · responses aren't saved</span>
		</div>
		<FormView definition={$state.snapshot(editor.draft)} submit={async () => true} />
	</div>
{/if}
