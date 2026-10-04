<script lang="ts" module>
	// A, B, … Z, then numbers (a question can have up to 100 options).
	export const letter = (j: number) => (j < 26 ? String.fromCharCode(65 + j) : String(j + 1));
</script>

<script lang="ts">
	import { cn } from '$lib/utils';

	// The A/B/C badge on a multiple-choice option, in the editor and on the public form.
	let { index, class: className }: { index: number; class?: string } = $props();
</script>

<span
	aria-hidden="true"
	class={cn(
		'inline-flex size-5 shrink-0 items-center justify-center rounded-xs bg-muted-foreground text-eyebrow text-card',
		className
	)}
>
	{letter(index)}
</span>
