<script lang="ts">
	import { formDraft } from '@taipoo/form-core';
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import logo from '$lib/assets/taipoo_logo.svg';
	import { authClient } from '$lib/auth-client';
	import FormView from '$lib/components/form-view/form-view.svelte';
	import { Button } from '$lib/components/ui/button';

	// Compact landing: one 640px column, left-aligned, and the product itself as the only framed surface.
	// No logo strip, testimonials or stats: we'd have to invent them. Colors, type and radii come from DESIGN.md.

	// The demo is a real form, rendered by the same component as /f/[slug]. Answers stay in the browser.
	// One question per page, so the frame stays small and Next/Back show off multi-page forms.
	const demo = formDraft.parse({
		title: 'Book a product demo',
		description: 'Tell us a little about your team and we’ll tailor a 20-minute walkthrough.',
		blocks: [
			{ id: 'name', type: 'short_text', title: '👋 What’s your full name?', required: true },
			{ id: 'p2', type: 'page_break' },
			{
				id: 'size',
				type: 'multiple_choice',
				title: '🏢 How big is your team?',
				required: true,
				options: [
					{ id: 'small', label: '1–10 people' },
					{ id: 'mid', label: '11–200 people' },
					{ id: 'large', label: '200+ people' }
				]
			},
			{ id: 'p3', type: 'page_break' },
			{
				id: 'goal',
				type: 'multiple_choice',
				title: '🎯 What do you want to achieve?',
				required: true,
				allowMultiple: true,
				options: [
					{ id: 'leads', label: 'Capture more qualified leads' },
					{ id: 'feedback', label: 'Collect customer feedback' },
					{ id: 'ops', label: 'Streamline internal requests' }
				]
			},
			{ id: 'p4', type: 'page_break' },
			{
				id: 'timeline',
				type: 'multiple_choice',
				title: '📅 When are you looking to get started?',
				required: true,
				options: [
					{ id: 'now', label: 'This month' },
					{ id: 'quarter', label: 'This quarter' },
					{ id: 'exploring', label: 'Just exploring' }
				]
			},
			{ id: 'p5', type: 'page_break' },
			{ id: 'email', type: 'email', title: '📬 What’s your work email?', required: true }
		],
		settings: { thankYouMessage: '✅ Thanks! We’ll email you within one business day to schedule your demo.' }
	});
	const submit = async () => true;

	// The headline types itself out, with a Google Docs-style caret at the end. Prerendered in full (for search
	// and no-JS visitors); the browser restarts it from empty. Reduced motion: shown whole, caret steady.
	const headline = 'Forms as easy as writing a doc.';
	let typed = $state(headline.length);
	const typing = $derived(typed < headline.length);
	onMount(() => {
		if (prefersReducedMotion.current) return;
		typed = 0;
		let timer: ReturnType<typeof setTimeout>;
		// a little uneven, like a person typing; a beat after each space
		const next = () => {
			typed++;
			if (!typing) return;
			timer = setTimeout(next, (headline[typed - 1] === ' ' ? 90 : 45) + Math.random() * 50);
		};
		timer = setTimeout(next, 400);
		return () => clearTimeout(timer);
	});

	// The page is prerendered for everyone; once it runs in the browser, signed-in people get a way back in.
	let signedIn = $state(false);
	onMount(async () => {
		const { data } = await authClient.getSession();
		signedIn = !!data;
	});
</script>

<svelte:head>
	<title>Taipoo: forms you write like a document</title>
	<meta
		name="description"
		content="Write a form like a document, publish a link, and read every response in one table."
	/>
</svelte:head>

<div class="min-h-dvh bg-background">
	<header class="mx-auto flex max-w-[640px] items-center justify-between px-6 py-5">
		<a href="/" class="flex items-center gap-2 text-title-sm">
			<img src={logo} alt="" width="28" height="28" class="size-7" />
			Taipoo
		</a>
		<nav class="flex items-center gap-1">
			{#if signedIn}
				<Button href="/dashboard" variant="ghost">Open Taipoo</Button>
			{:else}
				<Button href="/login" variant="ghost">Log in</Button>
			{/if}
		</nav>
	</header>

	<main class="mx-auto max-w-[640px] px-6 pt-10 pb-20 md:pt-16">
		<!-- The invisible full text holds the final size, so nothing below moves while it types. -->
		<h1 class="enter grid text-heading-1" style="--i: 0">
			<span class="sr-only">{headline}</span>
			<span class="invisible col-start-1 row-start-1" aria-hidden="true">{headline}</span>
			<span class="col-start-1 row-start-1" aria-hidden="true"
				>{headline.slice(0, typed)}<span class={['caret', typing && 'typing']}></span></span
			>
		</h1>
		<p class="enter mt-4 max-w-[52ch] text-body-md text-muted-foreground" style="--i: 1">
			Type a question, press Enter, keep going. Split it into pages, publish a link, and see every response in
			one table.
		</p>
		<div class="enter mt-7 flex flex-wrap items-center gap-2" style="--i: 2">
			{#if signedIn}
				<Button href="/dashboard">Go to your forms</Button>
			{:else}
				<Button href="/signup">Create a form</Button>
				<Button href="/login" variant="outline">Log in</Button>
			{/if}
		</div>

		<figure style="--i: 3" class="enter mt-12 overflow-hidden rounded-xl border border-border bg-card shadow-elevated md:mt-14">
			<figcaption
				class="flex items-center gap-2 border-b border-border px-6 py-3 text-caption text-muted-foreground md:px-8"
			>
				<span class="size-2 shrink-0 rounded-full bg-success" aria-hidden="true"></span>
				<span class="font-medium text-foreground">A live Taipoo form</span>
				<span class="ms-auto hidden sm:inline">Try it. Answers stay in your browser.</span>
			</figcaption>
			<FormView definition={demo} {submit} badge={false} compact />
		</figure>
	</main>

	<footer class="border-t border-border">
		<div class="mx-auto flex max-w-[640px] items-center justify-between px-6 py-5 text-caption text-muted-foreground">
			<span class="flex items-center gap-2">
				<img src={logo} alt="" width="20" height="20" class="size-5" />
				Taipoo
			</span>
			<nav class="flex gap-1">
				<a href="/login" class="inline-flex h-10 items-center px-2 hover:text-foreground">Log in</a>
				<a href="/signup" class="inline-flex h-10 items-center px-2 hover:text-foreground">Sign up</a>
			</nav>
		</div>
	</footer>
</div>

<style>
	/* Google Docs' collaborator caret: a 2px bar with a small square flag on top. Solid while typing, then blinks. */
	/* Inline, spanning ascenders to descenders; the negative margin keeps it from taking width (or wrapping). */
	.caret {
		position: relative;
		display: inline-block;
		width: 2px;
		height: 1.05em;
		margin-left: 0.04em;
		margin-right: calc(-2px - 0.04em);
		vertical-align: -0.2em;
		background: var(--color-primary);
	}
	.caret::before {
		content: '';
		position: absolute;
		top: -2px;
		left: -2px;
		width: 6px;
		height: 6px;
		background: inherit;
	}
	@media (prefers-reduced-motion: no-preference) {
		.caret:not(.typing) {
			animation: blink 1.1s steps(1) infinite;
		}
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	/* One staged entrance on first load, in reading order: headline, description, actions, then the demo,
	   100ms apart (--i). opacity/transform/filter only, so nothing around them moves. Off with reduced motion. */
	@media (prefers-reduced-motion: no-preference) {
		.enter {
			animation: enter 400ms ease-out calc(var(--i) * 100ms) both;
		}
	}
	@keyframes enter {
		from {
			opacity: 0;
			transform: translateY(12px);
			filter: blur(4px);
		}
	}
</style>
