<script lang="ts">
	import { formatAnswer, resultColumns, type FormDefinition } from '@taipoo/form-core';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import LinkIcon from '@lucide/svelte/icons/link';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import { toast } from 'svelte-sonner';
	import { api } from '$lib/api';
	import { questionKinds } from '$lib/components/questions';
	import { copyLink } from '$lib/form-actions';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Table from '$lib/components/ui/table';
	import { pageHeader } from '$lib/page-header.svelte';
	import { keepLast } from '$lib/utils';
	import { formTitle, workspace } from '$lib/workspace';

	let { data } = $props();

	type Page = typeof data.responses;
	type Response = Page['items'][number];

	const lastResponses = keepLast<Page>();
	const lastForm = keepLast<typeof data.form>();
	const responses = $derived(lastResponses(data.responses));
	const form = $derived(lastForm(data.form));

	// Writable deriveds: they follow the loaded form, and "Load more" appends to them.
	let rows = $derived<Response[]>(responses.items);
	let nextCursor = $derived(responses.nextCursor);
	let loadingMore = $state(false);
	let open = $state<Response | null>(null);

	const live = $derived(form.publishedVersionId !== null);
	const total = $derived(responses.total);
	const versions = $derived(new Map(responses.versions.map((v) => [v.id, v.definition as FormDefinition])));
	// Columns across every version, so answers to since-deleted questions still show (see resultColumns).
	const columns = $derived(resultColumns(responses.versions.map((v) => v.definition as FormDefinition)));

	// Each answer is read with the question from the version the respondent saw.
	const answer = (r: Response, questionId: string) =>
		formatAnswer(
			versions.get(r.formVersionId)?.questions.find((q) => q.id === questionId),
			r.answers[questionId]
		);
	const when = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

	async function loadMore() {
		if (!nextCursor) return;
		loadingMore = true;
		const res = await api()
			.forms[':id'].responses.$get({ param: { id: form.id }, query: { cursor: nextCursor } })
			.catch(() => null);
		loadingMore = false;
		if (!res?.ok) return void toast.error("Couldn't load more responses. Try again.");
		const page = await res.json();
		rows = [...rows, ...page.items];
		nextCursor = page.nextCursor;
	}


	$effect(() => {
		pageHeader.crumbs = [workspace.name, formTitle(form.draft.title), 'Results'];
		pageHeader.actions = actions;
		return () => {
			pageHeader.crumbs = undefined;
			pageHeader.actions = undefined;
		};
	});
</script>

{#snippet actions()}
	{#if live}
		<button
			type="button"
			onclick={() => copyLink(form.slug)}
			class="inline-flex items-center gap-1.5 text-caption font-semibold text-muted-foreground hover:text-foreground"
		>
			<LinkIcon class="size-4" /> Copy link
		</button>
	{/if}
	{#if total > 0}
		<a
			href="/api/forms/{form.id}/responses.csv"
			download
			class="ms-2 inline-flex items-center gap-1.5 text-caption font-semibold text-muted-foreground hover:text-foreground"
		>
			<DownloadIcon class="size-4" /> Download CSV
		</a>
	{/if}
	<Button size="sm" class="ms-2 h-7 px-3" href="/forms/{form.id}/edit"><PencilIcon /> Edit</Button>
{/snippet}

<svelte:head><title>Results · {formTitle(form.draft.title)} · Taipoo</title></svelte:head>

<div class="pt-10 md:pt-16">
	<!-- Notion-style: title, count and table share one left edge (the table's 16px cell padding). -->
	<div class="px-4">
		<h1 class="text-heading-2">{formTitle(form.draft.title)}</h1>
		<p class="mt-1 text-caption text-muted-foreground">
			{total === 1 ? '1 response' : `${total} responses`}
		</p>
	</div>

	{#if total === 0}
		<div class="mt-8 max-w-2xl px-4">
			<Card.Root class="items-center gap-3 rounded-xl bg-background p-8 text-center">
				<p class="text-title-sm">No responses yet</p>
				<p class="text-caption text-muted-foreground">
					{live
						? "Share your form's link to start collecting responses."
						: 'Publish your form to start collecting responses.'}
				</p>
				{#if live}
					<Button shape="pill" onclick={() => copyLink(form.slug)}><LinkIcon /> Copy link</Button>
				{:else}
					<Button shape="pill" href="/forms/{form.id}/edit"><PencilIcon /> Edit form</Button>
				{/if}
			</Card.Root>
		</div>
	{:else}
		<!-- Notion-style database: full width, scrolls sideways; a row opens the response in a side peek. -->
		<div class="mt-8 border-y border-border bg-card">
			<Table.Root>
				<Table.Header>
					<Table.Row class="hover:bg-transparent">
						<Table.Head class="w-48 border-e text-caption font-normal">
							<span class="flex items-center gap-1.5"><CalendarIcon class="size-4 shrink-0" /> Submitted</span>
						</Table.Head>
						{#each columns as q (q.id)}
							{@const kind = questionKinds[q.type]}
							<Table.Head class="max-w-80 min-w-48 border-e text-caption font-normal last:border-e-0">
								<span class="flex items-center gap-1.5">
									<kind.icon class="size-4 shrink-0" />
									<span class="truncate">{q.title || 'Untitled'}</span>
								</span>
							</Table.Head>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each rows as r (r.id)}
						<Table.Row
							class="cursor-pointer"
							onclick={() => (open = r)}
							onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (open = r))}
							tabindex={0}
							aria-label="Open response from {when.format(new Date(r.submittedAt))}"
						>
							<Table.Cell class="border-e text-muted-foreground">{when.format(new Date(r.submittedAt))}</Table.Cell>
							{#each columns as q (q.id)}
								<Table.Cell class="max-w-80 min-w-48 truncate border-e last:border-e-0">{answer(r, q.id)}</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
		{#if nextCursor}
			<div class="flex justify-center py-6">
				<Button variant="outline" size="sm" onclick={loadMore} disabled={loadingMore}>
					{loadingMore ? 'Loading…' : 'Load more'}
				</Button>
			</div>
		{/if}
	{/if}
</div>

<!-- Side peek: the whole response, every question in the order of the response's own version. -->
<Sheet.Root open={open !== null} onOpenChange={(o) => !o && (open = null)}>
	<Sheet.Content side="right" class="w-full gap-0 overflow-y-auto sm:max-w-md">
		{#if open}
			{@const r = open}
			<Sheet.Header class="border-b border-border p-6">
				<Sheet.Title class="text-title-sm">Response</Sheet.Title>
				<Sheet.Description>{when.format(new Date(r.submittedAt))}</Sheet.Description>
			</Sheet.Header>
			<dl class="flex flex-col gap-5 p-6">
				{#each columns as q (q.id)}
					{@const text = answer(r, q.id)}
					{@const kind = questionKinds[q.type]}
					<div class="flex flex-col gap-1">
						<dt class="flex items-center gap-1.5 text-caption text-muted-foreground">
							<kind.icon class="size-4 shrink-0" />
							{q.title || 'Untitled'}
						</dt>
						<dd class="text-body-md whitespace-pre-line {text ? '' : 'text-muted-foreground'}">{text || '—'}</dd>
					</div>
				{/each}
			</dl>
		{/if}
	</Sheet.Content>
</Sheet.Root>
