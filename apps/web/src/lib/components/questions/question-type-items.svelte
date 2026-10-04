<script lang="ts">
	import type { QuestionType } from '@taipoo/form-core';
	import * as Command from '$lib/components/ui/command';
	import { questionKinds } from '.';

	// The question types as Command items: shared by the "/" insert line and the block's + menu.
	let { onpick }: { onpick: (type: QuestionType) => void } = $props();

	const types = Object.keys(questionKinds) as QuestionType[];
</script>

<Command.List>
	<Command.Empty class="py-3 text-center text-caption text-muted-foreground">No matching question type</Command.Empty>
	<Command.Group heading="Questions">
		{#each types as type (type)}
			{@const kind = questionKinds[type]}
			<Command.Item value={kind.label} keywords={[type]} onSelect={() => onpick(type)} class="h-8 text-body-sm">
				<kind.icon class="text-muted-foreground" />
				{kind.label}
			</Command.Item>
		{/each}
	</Command.Group>
</Command.List>
