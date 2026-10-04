<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import type { EditorProps } from '.';

	let { editor, question }: EditorProps<'multiple_choice'> = $props();

	const id = $derived(`allow-multiple-${question.id}`);
</script>

<div class="flex items-center justify-between gap-4">
	<Label for={id} class="text-body-sm font-normal">Allow multiple</Label>
	<Switch {id} checked={question.allowMultiple} onCheckedChange={(allowMultiple) => editor.update(question.id, { allowMultiple })} />
</div>
