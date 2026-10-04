<script lang="ts">
	import type { Answers } from '@taipoo/form-core';
	import { toast } from 'svelte-sonner';
	import { api } from '$lib/api';
	import FormView from '$lib/components/form-view/form-view.svelte';

	let { data } = $props();

	async function submit(answers: Answers, website: string) {
		const { slug, versionId } = data.form;
		const res = await api()
			.f[':slug'].responses.$post({ param: { slug }, json: { versionId, answers, website } })
			.catch(() => null);
		if (res?.ok) return true;

		// Thrown API errors aren't in the RPC types: { error: { code, message, details? } }.
		const status = res?.status as number | undefined;
		const body = (await res?.json().catch(() => null)) as unknown as {
			error?: { details?: { path: string; message: string }[] };
		} | null;
		if (status === 400 && body?.error?.details) {
			return Object.fromEntries(body.error.details.map((d) => [d.path.split('.')[0]!, d.message]));
		}
		if (status === 409) {
			toast.error('This form was updated since you opened it.', {
				action: { label: 'Reload', onClick: () => location.reload() }
			});
		} else if (status === 429) {
			toast.error('Too many submissions. Wait a minute and try again.');
		} else {
			toast.error("Couldn't submit the form. Try again.");
		}
		return false;
	}
</script>

<svelte:head><title>{data.form.definition.title || 'Form'}</title></svelte:head>

<main class="min-h-dvh bg-background">
	<FormView definition={data.form.definition} {submit} />
</main>
