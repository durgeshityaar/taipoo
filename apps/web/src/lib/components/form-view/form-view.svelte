<script lang="ts">
	import { answersSchemaFor, pagesOf, type Answers, type FormDraft, type Question } from '@taipoo/form-core';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { onMount, tick, type Component } from 'svelte';
	import logo from '$lib/assets/taipoo_logo.svg';
	import { questionKinds, type FieldProps } from '$lib/components/questions';
	import { Button } from '$lib/components/ui/button';

	// A form as respondents see it: title, questions one page at a time (Next/Back), validation, Submit, thank-you screen. Used by the
	// public page (/f/[slug]) and the editor's Preview, so the preview is exactly what people get.
	//
	// `submit` gets valid answers and resolves to true (show the thank-you screen), false (stay; it already
	// told the user why), or per-question errors from the server.
	// `badge`: the fixed "Made with Taipoo" link; off where the form is embedded (the landing page demo).
	// `compact`: embedded in a frame rather than filling a page: a smaller type scale, tighter spacing, no
	// scroll-to-top on submit. Fields keep their 44px touch height.
	let {
		definition,
		submit,
		badge = true,
		compact = false
	}: {
		definition: FormDraft;
		submit: (answers: Answers, honeypot: string) => Promise<boolean | Record<string, string>>;
		badge?: boolean;
		compact?: boolean;
	} = $props();

	const schema = $derived(answersSchemaFor(definition));
	const pages = $derived(pagesOf(definition));
	let page = $state(0);
	const current = $derived(pages[page] ?? []);
	const lastPage = $derived(page >= pages.length - 1);

	let answers = $state<Record<string, string | string[]>>({});
	let website = $state(''); // honeypot
	let submitting = $state(false);
	// The public page is server-rendered: until its JavaScript runs, Submit would do a plain browser submit
	// (a GET reload) and lose every answer. So it starts disabled and turns on once the page is interactive.
	let ready = $state(false);
	onMount(() => (ready = true));
	let submitted = $state(false);
	let attempted = $state(false);
	let serverErrors = $state<Record<string, string>>({});

	// questionId → message. Empty until the first Next/Submit on a page, then live, so each message clears as you fix it.
	const errors = $derived.by((): Record<string, string> => {
		if (!attempted) return {};
		const result = schema.safeParse(answers);
		const client = Object.fromEntries(result.error?.issues.map((i) => [String(i.path[0]), i.message]) ?? []);
		return { ...serverErrors, ...client };
	});

	const fieldId = (q: Question) => `q-${q.id}`;
	// TS can't correlate q.type with the looked-up Field's props; questionKinds' type guarantees the match.
	const fieldFor = (q: Question) => questionKinds[q.type].Field as Component<FieldProps<Question>, {}, 'value'>;

	const scrollToTop = () => !compact && window.scrollTo({ top: 0 });

	function goTo(p: number) {
		page = p;
		attempted = false; // the new page's messages wait for its own Next/Submit
		scrollToTop();
	}

	// Next checks only this page; Submit (last page) sends everything.
	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		attempted = true;
		serverErrors = {};
		const parsed = schema.safeParse(answers);
		if (!lastPage) {
			if (!current.some((q) => errors[q.id])) return goTo(page + 1);
		} else if (parsed.success) {
			submitting = true;
			const result = await submit(parsed.data, website);
			submitting = false;
			if (result === true) {
				submitted = true;
				return scrollToTop();
			}
			if (result) serverErrors = result;
		}
		// Show the first problem, which a server error can put on an earlier page.
		const errorPage = pages.findIndex((p) => p.some((q) => errors[q.id]));
		if (errorPage === -1) return;
		page = errorPage;
		await tick();
		const first = pages[errorPage]!.find((q) => errors[q.id]);
		if (first) document.getElementById(fieldId(first))?.focus();
	}
</script>

{#snippet thanks()}
	<div class={['flex flex-col gap-3 text-center', compact ? 'py-8' : 'pt-16']}>
		<h1 class={compact ? 'text-heading-3' : 'text-heading-2'}>{definition.settings.thankYouMessage || 'Thanks for filling this out.'}</h1>
		<p class="text-caption text-muted-foreground">Your response has been recorded.</p>
		<div class="mt-5">
			<Button href="/signup" shape="pill" size="lg">Create your own form with Taipoo <ArrowRightIcon /></Button>
		</div>
	</div>
{/snippet}

{#snippet questionnaire()}
	<!-- Multi-page forms keep the Back row's space on page 1 too, so the form doesn't shift down when it appears. -->
	{#if pages.length > 1}
		<div class="mb-4 h-8">
			{#if page > 0}
				<Button variant="ghost" size="sm" class="-ms-2.5 text-muted-foreground" onclick={() => goTo(page - 1)}>
					<ArrowLeftIcon /> Back
				</Button>
			{/if}
		</div>
	{/if}
	<h1 class={compact ? 'text-heading-3' : 'text-heading-1'}>{definition.title}</h1>
	{#if definition.description}
		<p class={['whitespace-pre-line text-muted-foreground', compact ? 'mt-1.5 text-body-sm' : 'mt-3 text-body-md']}>{definition.description}</p>
	{/if}

	<form class={['flex flex-col', compact ? 'mt-6 gap-6' : 'mt-10 gap-8']} novalidate {onsubmit}>
		<!-- Compact: every page sits in the same grid cell, the others hidden, so the frame is as tall as the
		     tallest page and doesn't resize on Next/Back. -->
		<div class="grid">
			{#each pages as questions, i (i)}
				{#if compact || i === page}
					<div
						class={['col-start-1 row-start-1 flex flex-col', compact ? 'gap-6' : 'gap-8', i !== page && 'invisible']}
						inert={i !== page}
					>
						{#each questions as question (question.id)}
							{@const id = fieldId(question)}
							{@const Field = fieldFor(question)}
							<div class={['flex flex-col', compact ? 'gap-2' : 'gap-2.5']}>
								<p id="{id}-label" class={compact ? 'text-title-sm' : 'text-title'}>
									{question.title}{#if question.required}<span class="ms-1 text-muted-foreground" aria-hidden="true">*</span>{/if}
								</p>
								{#if question.description}
									<p class="-mt-1 text-body-sm whitespace-pre-line text-muted-foreground">{question.description}</p>
								{/if}
								<Field {question} {id} invalid={i === page && !!errors[question.id]} bind:value={answers[question.id]} />
								{#if i === page && errors[question.id]}
									<p class="text-caption text-destructive">{errors[question.id]}</p>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			{/each}
		</div>

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
			<Button type="submit" shape="pill" size="lg" disabled={!ready || submitting}>
				{lastPage ? (submitting ? 'Submitting…' : 'Submit') : 'Next'}
				<ArrowRightIcon />
			</Button>
		</div>
	</form>
{/snippet}

<div class={compact ? 'w-full px-6 py-6 md:px-8 md:py-7' : 'mx-auto w-full max-w-2xl px-4 pt-16 pb-28 md:pt-24'}>
	{#if compact}
		<!-- The thank-you screen takes the form's place in the same cell, so the frame keeps its size. -->
		<div class="grid">
			{#if submitted}<div class="col-start-1 row-start-1 self-center">{@render thanks()}</div>{/if}
			<div class={['col-start-1 row-start-1', submitted && 'invisible']} inert={submitted}>{@render questionnaire()}</div>
		</div>
	{:else if submitted}
		{@render thanks()}
	{:else}
		{@render questionnaire()}
	{/if}
</div>

{#if badge}
<a
	href="/"
	class="fixed right-4 bottom-4 inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-caption font-semibold text-primary shadow-xs hover:bg-hover"
>
	Made with Taipoo <img src={logo} alt="" class="size-4" />
</a>
{/if}
