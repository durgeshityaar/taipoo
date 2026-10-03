<!-- design: header = warm band + eyebrow type, 16px side padding (DESIGN.md → Components: Table). Reapply after --overwrite. -->
<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLThAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLThAttributes> = $props();
</script>

<th bind:this={ref} data-slot="table-head" class={cn("bg-muted text-muted-foreground text-eyebrow h-10 px-4 text-left align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className)} {...restProps}>
	{@render children?.()}
</th>
