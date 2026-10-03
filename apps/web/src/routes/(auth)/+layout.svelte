<script lang="ts">
	let { children } = $props();
</script>

<main class="bg-background flex min-h-svh items-center justify-center p-6">
	<div class="w-full max-w-sm">
		{@render children()}
	</div>
</main>
