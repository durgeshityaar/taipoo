<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authClient, redirectTarget } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let submitting = $state(false);

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;
		const { error: failed } = await authClient.signIn.email({ email, password });
		submitting = false;
		if (failed) {
			error = failed.message ?? 'Could not sign in. Try again.';
			return;
		}
		await goto(redirectTarget(page.url), { replaceState: true });
	}
</script>

<svelte:head><title>Log in · Taipoo</title></svelte:head>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-title">Log in</Card.Title>
		<Card.Description>Welcome back. Enter your email and password.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form {onsubmit} class="grid gap-4">
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" autocomplete="email" required bind:value={email} />
			</div>
			<div class="grid gap-2">
				<Label for="password">Password</Label>
				<Input id="password" type="password" autocomplete="current-password" required bind:value={password} />
			</div>
			{#if error}
				<p role="alert" class="text-destructive text-sm">{error}</p>
			{/if}
			<Button type="submit" class="w-full" disabled={submitting}>
				{submitting ? 'Logging in…' : 'Log in'}
			</Button>
		</form>
	</Card.Content>
	<Card.Footer class="text-muted-foreground justify-center text-sm">
		No account yet?&nbsp;<a href="/signup{page.url.search}" class="text-foreground underline underline-offset-4">Sign up</a>
	</Card.Footer>
</Card.Root>
