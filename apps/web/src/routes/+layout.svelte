<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<!-- One toast container for the whole app: call `toast("Saved")` from 'svelte-sonner' anywhere. -->
<Toaster position="bottom-right" />
{@render children()}
