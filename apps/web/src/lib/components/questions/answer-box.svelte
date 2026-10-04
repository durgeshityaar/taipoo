<script lang="ts">
	import type { Component } from 'svelte';
	import { cn } from '$lib/utils';

	// What a respondent will type into, drawn as an empty input with the type's icon on the right.
	// Not a disabled <Input>: its 50% opacity would read as broken.
	let { icon: Icon, class: className }: { icon: Component<{ class?: string }>; class?: string } = $props();
</script>

<div
	aria-hidden="true"
	class={cn('flex h-9 items-center justify-end rounded-md border border-input bg-card px-3.5 shadow-xs', className)}
>
	<Icon class="size-4 text-muted-foreground" />
</div>
