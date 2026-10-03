<script lang="ts">
	let { data } = $props();
</script>

<svelte:head><title>Dashboard · Taipoo</title></svelte:head>

<h1 class="text-heading-2">Your forms</h1>
<p class="text-caption text-muted-foreground mt-1">Signed in as {data.user.name}. The form list comes next.</p>
