<script lang="ts">
	import { renameForm } from '$lib/form-actions';
	import { cn } from '$lib/utils';

	// Renames a form in place: starts with the title selected; Enter or clicking away saves, Escape cancels.
	let {
		form,
		ondone,
		class: className
	}: { form: { id: string; title: string }; ondone: () => void; class?: string } = $props();

	let done = false;
	function finish(save: boolean, input: HTMLInputElement) {
		if (done) return; // Enter/Escape, then the blur that follows
		done = true;
		const title = input.value.trim();
		if (save && title !== form.title) void renameForm(form.id, title);
		ondone();
	}

	const selectAll = (input: HTMLInputElement) => {
		input.focus();
		input.select();
	};
</script>

<input
	value={form.title}
	{@attach selectAll}
	maxlength={200}
	placeholder="Untitled"
	aria-label="Form name"
	onkeydown={(e) => {
		if (e.key === 'Enter') finish(true, e.currentTarget);
		if (e.key === 'Escape') finish(false, e.currentTarget);
	}}
	onblur={(e) => finish(true, e.currentTarget)}
	class={cn('w-full border border-ring bg-card outline-none', className)}
/>
