<script lang="ts">
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { goto } from '$app/navigation';
	import logo from '$lib/assets/taipoo_logo.svg';
	import FormMenu from '$lib/components/form-menu/form-menu.svelte';
	import RenameInput from '$lib/components/form-menu/rename-input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { createForm } from '$lib/form-actions';
	import { pageHeader } from '$lib/page-header.svelte';
	import { timeAgo } from '$lib/utils';
	import { formTitle } from '$lib/workspace';

	// Home: a greeting and your forms as a Notion-style list. A row opens the editor; ⋯ has the same actions
	// as the sidebar. The list comes from the (app) layout, so it stays in sync with the sidebar.
	let { data } = $props();

	const hour = new Date().getHours();
	const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
	const firstName = $derived(data.user.name.split(' ')[0]);
	let renamingId = $state<string | null>(null);

	$effect(() => {
		pageHeader.actions = actions;
		return () => (pageHeader.actions = undefined);
	});
</script>

{#snippet actions()}
	<Button size="sm" class="h-7 px-3" onclick={createForm}><PlusIcon /> New form</Button>
{/snippet}

<svelte:head><title>Home · Taipoo</title></svelte:head>

<div class="mx-auto w-full max-w-3xl px-4 pt-10 pb-24 md:pt-16">
	<h1 class="text-heading-2">{greeting}, {firstName}</h1>

	{#if data.forms.length === 0}
		<Card.Root class="mt-10 items-center gap-3 rounded-xl bg-background p-8 text-center">
			<img src={logo} alt="" class="size-10 opacity-80" />
			<p class="text-title-sm">No forms yet</p>
			<p class="max-w-sm text-caption text-muted-foreground">
				Create a form, share its link, and watch the responses come in.
			</p>
			<Button shape="pill" class="mt-2" onclick={createForm}><PlusIcon /> New form</Button>
		</Card.Root>
	{:else}
		<section class="mt-10">
			<h2 class="mb-2 text-eyebrow text-muted-foreground">Your forms · {data.forms.length}</h2>
			<div class="overflow-hidden rounded-lg border border-border bg-card">
				<Table.Root>
					<Table.Header>
						<Table.Row class="hover:bg-transparent">
							<Table.Head>Name</Table.Head>
							<Table.Head class="w-24">Status</Table.Head>
							<Table.Head class="w-28 text-right">Responses</Table.Head>
							<Table.Head class="w-36">Edited</Table.Head>
							<Table.Head class="w-12"><span class="sr-only">Actions</span></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.forms as form (form.id)}
							{@const live = form.publishedVersionId !== null}
							<Table.Row class="group cursor-pointer" onclick={() => renamingId !== form.id && goto(`/forms/${form.id}/edit`)}>
								<Table.Cell class="max-w-0">
									{#if renamingId === form.id}
										<RenameInput {form} ondone={() => (renamingId = null)} class="h-8 rounded-xs px-2 text-body-sm" />
									{:else}
										<a href="/forms/{form.id}/edit" class="flex min-w-0 items-center gap-2 outline-none focus-visible:underline">
											<FileTextIcon class="size-4 shrink-0 text-muted-foreground" />
											<span class="truncate font-medium">{formTitle(form.title)}</span>
										</a>
									{/if}
								</Table.Cell>
								<Table.Cell>
									{#if live}
										<span class="inline-flex items-center gap-1.5 text-success"><span class="size-1.5 rounded-full bg-success"></span>Live</span>
									{:else}
										<span class="text-muted-foreground">Draft</span>
									{/if}
								</Table.Cell>
								<Table.Cell class="text-right tabular-nums">
									<a
										href="/forms/{form.id}/results"
										onclick={(e) => e.stopPropagation()}
										class="rounded-xs px-1 hover:bg-hover hover:underline {form.responseCount ? '' : 'text-muted-foreground'}"
										aria-label="{form.responseCount} responses, open results">{form.responseCount}</a
									>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground" title={new Date(form.updatedAt).toLocaleString()}>
									{timeAgo(form.updatedAt)}
								</Table.Cell>
								<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
								<Table.Cell class="py-0 pe-2" onclick={(e: MouseEvent) => e.stopPropagation()}>
									<FormMenu
										{form}
										onrename={() => (renamingId = form.id)}
										class="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100"
									/>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</section>
	{/if}
</div>
