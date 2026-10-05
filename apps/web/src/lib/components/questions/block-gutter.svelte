<script lang="ts" module>
	import type { FormEditor } from '$lib/form-editor/form-editor.svelte';

	// Keys on a block's focusable element (a question's title, a page divider): Enter opens an insert line
	// under it, Alt+↑/↓ moves it, ⌘/Ctrl+D duplicates it.
	export const blockKeydown = (editor: FormEditor, id: string, index: number) => (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.isComposing) {
			e.preventDefault();
			editor.insertAt = index + 1;
		} else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
			e.preventDefault();
			editor.move(id, e.key === 'ArrowUp' ? -1 : 1);
		} else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
			e.preventDefault(); // not the browser's bookmark
			editor.duplicate(id);
		}
	};
</script>

<script lang="ts">
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import type { Component, Snippet } from 'svelte';
	import { dragHandle } from 'svelte-dnd-action';
	import { Command as CommandPrimitive } from 'bits-ui';
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils';
	import QuestionTypeItems from './question-type-items.svelte';

	// A block's gutter: 🗑, + (insert below) and ⠿ (drag; click for the block menu). Hangs in the left margin
	// of a `relative group` parent. `menu` is the block-specific top of the menu; the shared actions follow it.
	let { editor, id, index, what, menu }: { editor: FormEditor; id: string; index: number; what: string; menu: Snippet } =
		$props();

	const first = $derived(index === 0);
	const last = $derived(index === editor.draft.blocks.length - 1);
	const mod = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl+';

	let menuOpen = $state(false);
	let addOpen = $state(false);

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

<!-- Shown on hover (always on touch screens). -->
<div
	class="absolute top-0.5 right-full flex items-center pr-2 text-muted-foreground opacity-0 group-hover:opacity-100 has-focus-visible:opacity-100 has-data-[state=open]:opacity-100 pointer-coarse:opacity-100"
>
	<Button variant="ghost" size="icon-xs" aria-label="Delete {what}" onclick={() => editor.remove(id)}>
		<TrashIcon class="size-4" />
	</Button>
	<!-- Opens the block types right here; the pick goes in below this block. -->
	<Popover.Root bind:open={addOpen}>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="ghost" size="icon-xs" aria-label="Insert a block below">
					<PlusIcon class="size-4" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<!-- No focus trap: picking a type moves the cursor into the new block while this closes. -->
		<Popover.Content align="start" class="w-72 gap-0 p-1" trapFocus={false} onCloseAutoFocus={(e) => e.preventDefault()}>
			<Command.Root class="bg-transparent p-0">
				<CommandPrimitive.Input
					placeholder="Search blocks"
					aria-label="Search blocks"
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
			{@render menu()}
			<Separator />
			<div class="flex flex-col p-1">
				{@render action(TrashIcon, 'Delete', 'Del', () => editor.remove(id), { destructive: true })}
				{@render action(CopyIcon, 'Duplicate', `${mod}D`, () => editor.duplicate(id))}
				{@render action(ArrowUpIcon, 'Move up', '⌥↑', () => editor.move(id, -1), { disabled: first })}
				{@render action(ArrowDownIcon, 'Move down', '⌥↓', () => editor.move(id, 1), { disabled: last })}
			</div>
		</Popover.Content>
	</Popover.Root>
</div>
