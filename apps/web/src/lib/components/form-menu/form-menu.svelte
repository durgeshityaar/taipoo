<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import LinkIcon from '@lucide/svelte/icons/link';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import TextCursorInputIcon from '@lucide/svelte/icons/text-cursor-input';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import { goto } from '$app/navigation';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { copyLink, deleteForm, duplicateForm } from '$lib/form-actions';
	import { cn } from '$lib/utils';
	import { formTitle } from '$lib/workspace';

	// A form's ⋯ menu (sidebar rows, Home rows): Edit, Rename, Copy link, Duplicate, Delete (confirmed).
	// Rename is the caller's: it renames in place, wherever the form is shown.
	let {
		form,
		onrename,
		side = 'bottom',
		class: className
	}: {
		form: { id: string; title: string; slug: string; publishedVersionId: string | null };
		onrename: () => void;
		side?: 'bottom' | 'right';
		class?: string;
	} = $props();

	const live = $derived(form.publishedVersionId !== null);
	let confirmingDelete = $state(false);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<button
				{...props}
				aria-label="Actions for {formTitle(form.title)}"
				class={cn(
					'flex size-6 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-hover',
					className
				)}
			>
				<EllipsisIcon class="size-4" />
			</button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content {side} align={side === 'right' ? 'start' : 'end'} class="w-52">
		<DropdownMenu.Item onSelect={() => goto(`/forms/${form.id}/edit`)}><PencilIcon /> Edit</DropdownMenu.Item>
		<!-- After the menu has closed and returned focus, so the rename input keeps it. -->
		<DropdownMenu.Item onSelect={() => setTimeout(onrename)}><TextCursorInputIcon /> Rename</DropdownMenu.Item>
		<DropdownMenu.Item disabled={!live} onSelect={() => copyLink(form.slug)}>
			<LinkIcon />
			<span class="flex-1">Copy link to share</span>
			{#if !live}<span class="text-caption text-muted-foreground">Not live</span>{/if}
		</DropdownMenu.Item>
		<DropdownMenu.Item onSelect={() => duplicateForm(form.id)}><CopyIcon /> Duplicate</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item variant="destructive" onSelect={() => (confirmingDelete = true)}>
			<TrashIcon /> Delete
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<AlertDialog.Root bind:open={confirmingDelete}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete “{formTitle(form.title)}”?</AlertDialog.Title>
			<AlertDialog.Description>
				The form{live ? ', its public link' : ''} and all of its responses will be deleted. This can't be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action variant="destructive" onclick={() => deleteForm(form.id)}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
