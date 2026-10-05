<script lang="ts">
	import type { BlockType } from '@taipoo/form-core';
	import { Command as CommandPrimitive, computeCommandScore } from 'bits-ui';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import type { FormEditor } from '$lib/form-editor/form-editor.svelte';
	import QuestionTypeItems from './question-type-items.svelte';

	// "Type / to insert a block": typing `/` opens the block types, filtered by what follows it;
	// picking one inserts a blank block of that type at `at`. The hint only shows while the line has the
	// cursor; otherwise it shows `idle` (e.g. "Press Enter to start from scratch" on an empty form).
	let { editor, at, idle = '' }: { editor: FormEditor; at: number; idle?: string } = $props();

	let value = $state('');
	let focused = $state(false);
	let input = $state<HTMLInputElement | null>(null);

	const filter = (itemValue: string, search: string, keywords?: string[]) =>
		search.length <= 1 ? 1 : computeCommandScore(itemValue, search.slice(1), keywords);

	function pick(type: BlockType) {
		value = '';
		editor.insert(at, type);
	}

	function close() {
		value = '';
		if (editor.insertAt === at) editor.insertAt = null;
	}

	// Opened from a title's Enter: take the cursor.
	const focusWhenOpened = (el: HTMLInputElement) => {
		if (editor.insertAt === at) el.focus();
	};
</script>

<!-- The popover renders in place (no portal): Command finds its items by querying inside its root. -->
<Command.Root {filter} class="h-auto overflow-visible rounded-none bg-transparent p-0">
	<CommandPrimitive.Input
		bind:value
		bind:ref={input}
		{@attach focusWhenOpened}
		onkeydown={(e) => {
			if (e.key === 'Escape' || (e.key === 'Backspace' && value === '')) close();
		}}
		onfocus={() => (focused = true)}
		onblur={() => {
			focused = false;
			if (value === '') close();
		}}
		placeholder={focused ? 'Type / to insert a question' : idle}
		aria-label="Insert a question"
		class="w-full bg-transparent text-body-md outline-none placeholder:text-faint"
	/>
	<Popover.Root open={value.startsWith('/')} onOpenChange={(open) => !open && close()}>
		<Popover.Content
			customAnchor={input}
			portalProps={{ disabled: true }}
			trapFocus={false}
			onOpenAutoFocus={(e) => e.preventDefault()}
			onCloseAutoFocus={(e) => e.preventDefault()}
			align="start"
			class="w-72 gap-0 p-1"
		>
			<QuestionTypeItems onpick={pick} />
		</Popover.Content>
	</Popover.Root>
</Command.Root>
