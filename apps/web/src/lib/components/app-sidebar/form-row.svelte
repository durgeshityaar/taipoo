<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import LinkIcon from '@lucide/svelte/icons/link';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import TextCursorInputIcon from '@lucide/svelte/icons/text-cursor-input';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { copyLink, deleteForm, duplicateForm, renameForm } from '$lib/form-actions';
	import { formTitle } from '$lib/workspace';

	// One form in the sidebar: a link to its editor, and a ⋯ menu (shown on hover) to edit, rename in place,
	// copy its public link, duplicate or delete it. The ⋯ sits out at the sidebar's edge (-right-5 undoes the
	// sub-list's right inset), in line with the workspace row's +.
	let { form }: { form: { id: string; title: string; slug: string; publishedVersionId: string | null } } = $props();

	const editUrl = $derived(`/forms/${form.id}/edit`);
	const live = $derived(form.publishedVersionId !== null);
	let renaming = $state(false);
	let confirmingDelete = $state(false);

	function commitRename(input: HTMLInputElement) {
		if (!renaming) return;
		renaming = false;
		const title = input.value.trim();
		if (title !== form.title) void renameForm(form.id, title);
	}

	// Rename starts with the whole title selected, ready to type over.
	const selectAll = (input: HTMLInputElement) => {
		input.focus();
		input.select();
	};
</script>

<Sidebar.MenuSubItem>
	{#if renaming}
		<input
			value={form.title}
			{@attach selectAll}
			maxlength={200}
			placeholder="Untitled"
			aria-label="Form name"
			onkeydown={(e) => {
				if (e.key === 'Enter') commitRename(e.currentTarget);
				if (e.key === 'Escape') renaming = false;
			}}
			onblur={(e) => commitRename(e.currentTarget)}
			class="h-7 w-full rounded-sm border border-ring bg-card px-2 text-nav outline-none"
		/>
	{:else}
		<Sidebar.MenuSubButton isActive={page.url.pathname.startsWith(`/forms/${form.id}/`)}>
			{#snippet child({ props })}
				<a href={editUrl} {...props}><span>{formTitle(form.title)}</span></a>
			{/snippet}
		</Sidebar.MenuSubButton>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						aria-label="Actions for {formTitle(form.title)}"
						class="absolute top-1/2 -right-5 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground opacity-0 outline-none group-hover/menu-sub-item:opacity-100 hover:bg-hover focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-hover data-[state=open]:opacity-100"
					>
						<EllipsisIcon class="size-4" />
					</button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content side="right" align="start" class="w-52">
				<DropdownMenu.Item onSelect={() => goto(editUrl)}><PencilIcon /> Edit</DropdownMenu.Item>
				<DropdownMenu.Item onSelect={() => setTimeout(() => (renaming = true))}>
					<TextCursorInputIcon /> Rename
				</DropdownMenu.Item>
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
	{/if}
</Sidebar.MenuSubItem>

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
