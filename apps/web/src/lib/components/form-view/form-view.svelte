<script lang="ts">
	import { answersSchemaFor, type Answers, type FormDraft, type Question } from '@taipoo/form-core';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { tick, type Component } from 'svelte';
	import logo from '$lib/assets/taipoo_logo.svg';
	import { questionKinds, type FieldProps } from '$lib/components/questions';
	import { Button } from '$lib/components/ui/button';

	// A form as respondents see it: title, questions, validation, Submit, thank-you screen. Used by the
	// public page (/f/[slug]) and the editor's Preview, so the preview is exactly what people get.
	//
	// `submit` gets valid answers and resolves to true (show the thank-you screen), false (stay; it already
	// told the user why), or per-question errors from the server.
	let {
		definition,
		submit
	}: {
		definition: FormDraft;
		submit: (answers: Answers, honeypot: string) => Promise<boolean | Record<string, string>>;
	} = $props();

	const schema = $derived(answersSchemaFor(definition));

	let answers = $state<Record<string, string | string[]>>({});
	let website = $state(''); // honeypot
	let submitting = $state(false);
	let submitted = $state(false);
	let attempted = $state(false);
	let serverErrors = $state<Record<string, string>>({});

	// questionId → message. Empty until the first Submit, then live, so each message clears as you fix it.
	const errors = $derived.by((): Record<string, string> => {
		if (!attempted) return {};
		const result = schema.safeParse(answers);
		const client = Object.fromEntries(result.error?.issues.map((i) => [String(i.path[0]), i.message]) ?? []);
		return { ...serverErrors, ...client };
	});

	const fieldId = (q: Question) => `q-${q.id}`;
	// TS can't correlate q.type with the looked-up Field's props; questionKinds' type guarantees the match.
	const fieldFor = (q: Question) => questionKinds[q.type].Field as Component<FieldProps<Question>, {}, 'value'>;

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		attempted = true;
		serverErrors = {};
		const parsed = schema.safeParse(answers);
		if (parsed.success) {
			submitting = true;
			const result = await submit(parsed.data, website);
			submitting = false;
			if (result === true) {
				submitted = true;
				window.scrollTo({ top: 0 });
				return;
			}
			if (result) serverErrors = result;
		}
		await tick();
		const first = definition.questions.find((q) => errors[q.id]);
		if (first) document.getElementById(fieldId(first))?.focus();
	}
</script>

<div class="mx-auto w-full max-w-2xl px-4 pt-16 pb-28 md:pt-24">
	{#if submitted}
		<div class="flex flex-col gap-3 pt-16 text-center">
			<h1 class="text-heading-2">{definition.settings.thankYouMessage || 'Thanks for filling this out.'}</h1>
			<p class="text-caption text-muted-foreground">Your response has been recorded.</p>
			<div class="mt-5">
				<Button href="/signup" shape="pill" size="lg">Create your own form with Taipoo <ArrowRightIcon /></Button>
			</div>
		</div>
	{:else}
		<h1 class="text-heading-1">{definition.title}</h1>
		{#if definition.description}
			<p class="mt-3 text-body-md whitespace-pre-line text-muted-foreground">{definition.description}</p>
		{/if}

		<form class="mt-10 flex flex-col gap-8" novalidate {onsubmit}>
			{#each definition.questions as question (question.id)}
				{@const id = fieldId(question)}
				{@const Field = fieldFor(question)}
				<div class="flex flex-col gap-2.5">
					<p id="{id}-label" class="text-title">
						{question.title}{#if question.required}<span class="ms-1 text-muted-foreground" aria-hidden="true">*</span>{/if}
					</p>
					{#if question.description}
						<p class="-mt-1 text-body-sm whitespace-pre-line text-muted-foreground">{question.description}</p>
					{/if}
					<Field {question} {id} invalid={!!errors[question.id]} bind:value={answers[question.id]} />
					{#if errors[question.id]}
						<p class="text-caption text-destructive">{errors[question.id]}</p>
					{/if}
				</div>
			{/each}

			<!-- Honeypot: invisible to people, irresistible to bots; the API drops submissions that fill it. -->
			<input
				bind:value={website}
				name="website"
				tabindex="-1"
				autocomplete="off"
				aria-hidden="true"
				class="absolute -left-[9999px] size-px opacity-0"
			/>

			<div>
				<Button type="submit" shape="pill" size="lg" disabled={submitting}>
					{submitting ? 'Submitting…' : 'Submit'}
					<ArrowRightIcon />
				</Button>
			</div>
		</form>
	{/if}
</div>

<a
	href="/"
	class="fixed right-4 bottom-4 inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-caption font-semibold text-primary shadow-xs hover:bg-hover"
>
	Made with Taipoo <img src={logo} alt="" class="size-4" />
</a>
