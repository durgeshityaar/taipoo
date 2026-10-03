<script lang="ts">
	import { page } from '$app/state';
	import AppSidebar from '$lib/components/app-sidebar/app-sidebar.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { pageHeader } from '$lib/page-header.svelte';

	let { data, children } = $props();

	// Pages with their own trail (the editor) set pageHeader.crumbs; others get "Taipoo › <title>".
	// New top-level page → one entry here.
	const titles: Record<string, string> = { '/dashboard': 'Dashboard' };
	const crumbs = $derived(
		pageHeader.crumbs ?? ['Taipoo', titles[page.url.pathname]].filter((crumb) => crumb !== undefined)
	);
</script>

<!-- App shell: collapsible sidebar + top bar (trigger, breadcrumb, page actions). See DESIGN.md → App shell. -->
<Sidebar.Provider>
	<AppSidebar user={data.user} forms={data.forms} />
	<Sidebar.Inset>
		<header
			class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
		>
			<div class="flex min-w-0 items-center gap-2 px-4">
				<Sidebar.Trigger class="-ms-1" />
				<Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						{#each crumbs as crumb, i (i)}
							{#if i > 0}
								<Breadcrumb.Separator class="hidden md:block" />
							{/if}
							{#if i < crumbs.length - 1}
								<Breadcrumb.Item class="hidden md:block">{crumb}</Breadcrumb.Item>
							{:else}
								<Breadcrumb.Item class="min-w-0">
									<Breadcrumb.Page class="truncate">{crumb}</Breadcrumb.Page>
								</Breadcrumb.Item>
							{/if}
						{/each}
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
			{#if pageHeader.actions}
				<div class="ms-auto flex items-center gap-2 px-4">
					{@render pageHeader.actions()}
				</div>
			{/if}
		</header>
		<main class="flex flex-1 flex-col gap-4 p-4 pt-0">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
