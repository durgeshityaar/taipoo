<!-- design: row hover = layered overlay (bg-muted is the page color). Reapply after --overwrite. -->
<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableRowElement>> = $props();
</script>

<tr
	bind:this={ref}
	data-slot="table-row"
	class={cn("hover:bg-hover data-[state=selected]:bg-accent border-b transition-colors has-aria-expanded:bg-hover", className)}
	{...restProps}
>
	{@render children?.()}
</tr>
