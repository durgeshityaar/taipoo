<script lang="ts">
	import type { FormDefinition } from '@taipoo/form-core';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { api } from '$lib/api';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { pageHeader } from '$lib/page-header.svelte';
	import { formTitle, workspace } from '$lib/workspace';

	let { data } = $props();

	// Writable deriveds: they follow the loaded form (opening another form resets them) and are edited in between.
	let title = $derived(data.form.draft.title);
	let live = $derived(data.form.publishedVersionId !== null);

	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let publishing = $state(false);

	// Autosave 600ms after the last keystroke. The request is captured when scheduled, so a save that
	// fires after you've switched to another form still writes to the form it belongs to.
	let pending: (() => Promise<void>) | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;

	function scheduleSave() {
		const id = data.form.id;
		const draft: FormDefinition = { ...data.form.draft, title };
		saveStatus = 'saving';
		pending = () => save(id, draft);
		clearTimeout(timer);
		timer = setTimeout(flush, 600);
	}

	async function flush() {
		clearTimeout(timer);
		const run = pending;
		pending = undefined;
		await run?.();
	}

	async function save(id: string, draft: FormDefinition) {
		const res = await api().forms[':id'].draft.$put({ param: { id }, json: draft });
		if (!res.ok) {
			saveStatus = 'error';
			toast.error("Couldn't save your changes. Try again.");
			return;
		}
		saveStatus = 'saved';
		await invalidate('app:forms'); // the sidebar lists the new title
	}

	onDestroy(flush); // leaving the editor mid-debounce still saves

	async function publish() {
		publishing = true;
		await flush(); // publish what's on screen, not the last save
		const res = await api().forms[':id'].publish.$post({ param: { id: data.form.id } });
		publishing = false;
		if (!res.ok) {
			// Rule violations (no title, no questions) come back as { error: { message } }.
			const body = (await res.json().catch(() => null)) as unknown as { error?: { message?: string } } | null;
			toast.error(body?.error?.message ?? "Couldn't publish the form. Try again.");
			return;
		}
		live = true;
		toast.success('Published');
	}

	$effect(() => {
		pageHeader.crumbs = [workspace.name, formTitle(title)];
		pageHeader.actions = actions;
		return () => {
			pageHeader.crumbs = undefined;
			pageHeader.actions = undefined;
		};
	});

	// New forms open with the cursor in the title, ready to type.
	const focusIfEmpty = (input: HTMLInputElement) => {
		if (!input.value) input.focus();
	};
</script>

{#snippet actions()}
	{#if saveStatus !== 'idle'}
		<span class="text-caption text-muted-foreground" aria-live="polite">
			{saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Not saved'}
		</span>
	{/if}
	<Badge variant={live ? 'success' : 'secondary'}>{live ? 'Live' : 'Draft'}</Badge>
	<Button size="sm" onclick={publish} disabled={publishing}>Publish</Button>
{/snippet}

<svelte:head><title>{formTitle(title)} · Taipoo</title></svelte:head>

<div class="mx-auto w-full max-w-2xl px-4 pt-16 md:pt-24">
	<input
		value={title}
		oninput={(e) => {
			title = e.currentTarget.value;
			scheduleSave();
		}}
		{@attach focusIfEmpty}
		maxlength={200}
		placeholder="Form title"
		aria-label="Form title"
		class="w-full bg-transparent text-heading-1 outline-none placeholder:text-faint"
	/>
</div>
