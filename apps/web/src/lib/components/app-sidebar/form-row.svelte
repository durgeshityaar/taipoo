<script lang="ts">
	import { page } from '$app/state';
	import FormMenu from '$lib/components/form-menu/form-menu.svelte';
	import RenameInput from '$lib/components/form-menu/rename-input.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { formTitle } from '$lib/workspace';

	// One form in the sidebar: a link to its editor, and a ⋯ menu shown on hover. The ⋯ sits out at the
	// sidebar's edge (-right-5 undoes the sub-list's right inset), in line with the workspace row's +.
	let { form }: { form: { id: string; title: string; slug: string; publishedVersionId: string | null } } = $props();

	let renaming = $state(false);
</script>

<Sidebar.MenuSubItem>
	{#if renaming}
		<RenameInput {form} ondone={() => (renaming = false)} class="h-7 rounded-sm px-2 text-nav" />
	{:else}
		<Sidebar.MenuSubButton isActive={page.url.pathname.startsWith(`/forms/${form.id}/`)}>
			{#snippet child({ props })}
				<a href="/forms/{form.id}/edit" {...props}><span>{formTitle(form.title)}</span></a>
			{/snippet}
		</Sidebar.MenuSubButton>
		<FormMenu
			{form}
			side="right"
			onrename={() => (renaming = true)}
			class="absolute top-1/2 -right-5 size-5 -translate-y-1/2 opacity-0 group-hover/menu-sub-item:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
		/>
	{/if}
</Sidebar.MenuSubItem>
