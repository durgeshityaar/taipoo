<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authClient, redirectTarget } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	// Better Auth's default minimum; the server enforces it too.
	const MIN_PASSWORD = 8;

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let submitting = $state(false);

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;
		// Signing up also signs you in (Better Auth sets the session cookie).
		const { error: failed } = await authClient.signUp.email({ name, email, password });
		submitting = false;
		if (failed) {
			error = failed.message ?? 'Could not create your account. Try again.';
			return;
		}
		await goto(redirectTarget(page.url), { replaceState: true });
	}
</script>

<svelte:head><title>Sign up · Taipoo</title></svelte:head>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-title">Create an account</Card.Title>
		<Card.Description>Start building forms in a minute.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form {onsubmit} class="grid gap-4">
			<div class="grid gap-2">
				<Label for="name">Name</Label>
				<Input id="name" autocomplete="name" required bind:value={name} />
			</div>
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" autocomplete="email" required bind:value={email} />
			</div>
			<div class="grid gap-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					type="password"
					autocomplete="new-password"
					minlength={MIN_PASSWORD}
					required
					aria-describedby="password-hint"
					bind:value={password}
				/>
				<p id="password-hint" class="text-muted-foreground text-xs">At least {MIN_PASSWORD} characters.</p>
			</div>
			{#if error}
				<p role="alert" class="text-destructive text-sm">{error}</p>
			{/if}
			<Button type="submit" class="w-full" disabled={submitting}>
				{submitting ? 'Creating account…' : 'Create account'}
			</Button>
		</form>
	</Card.Content>
	<Card.Footer class="text-muted-foreground justify-center text-sm">
		Already have an account?&nbsp;<a href="/login{page.url.search}" class="text-foreground underline underline-offset-4">Log in</a>
	</Card.Footer>
</Card.Root>
