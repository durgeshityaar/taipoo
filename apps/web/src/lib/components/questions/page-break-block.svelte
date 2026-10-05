<script lang="ts">
	import type { PageBreak } from '@taipoo/form-core';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import FileIcon from '@lucide/svelte/icons/file';
	import { Button } from '$lib/components/ui/button';
	import type { FormEditor } from '$lib/form-editor/form-editor.svelte';
	import BlockGutter, { blockKeydown } from './block-gutter.svelte';

	// A page break in the editor: the Next button that ends the page above, then a "Page N" divider.
	// `page` is the number of the page it starts.
	let { editor, block, index, page }: { editor: FormEditor; block: PageBreak; index: number; page: number } = $props();

	const issue = $derived(editor.issues[`blocks.${index}`]);
</script>

<div class="flex flex-col gap-8">
	<!-- What respondents will see at the end of the page above; not a control here. -->
	<div aria-hidden="true">
		<Button shape="pill" size="lg" tabindex={-1} class="pointer-events-none">Next <ArrowRightIcon /></Button>
	</div>
	<div class="group relative">
		<BlockGutter {editor} id={block.id} {index} what="page break">
			{#snippet menu()}
				<div class="flex items-center gap-2 px-3 py-2.5">
					<FileIcon class="size-4 shrink-0 text-muted-foreground" />
					<span class="truncate text-title-sm">Page {page}</span>
				</div>
			{/snippet}
		</BlockGutter>
		<!-- A button so the block keys (Alt+↑/↓, ⌘D) work on it like on a question title; click or Enter adds a block below. -->
		<button
			type="button"
			aria-label="Page {page} starts here. Add a block below"
			onclick={() => (editor.insertAt = index + 1)}
			onkeydown={blockKeydown(editor, block.id, index)}
			{@attach editor.focusOn(block.id)}
			class="flex h-7 w-full cursor-text items-center gap-3 rounded-sm text-caption text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<span class="h-px flex-1 bg-border"></span>
			Page {page}
			<span class="h-px flex-1 bg-border"></span>
		</button>
		{#if issue}<p class="mt-1 text-caption text-destructive">{issue}</p>{/if}
	</div>
</div>
