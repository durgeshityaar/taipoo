<script lang="ts">
	import type { BlockType, QuestionType } from '@taipoo/form-core';
	import FileIcon from '@lucide/svelte/icons/file';
	import * as Command from '$lib/components/ui/command';
	import { questionKinds } from '.';

	// The block types as Command items: shared by the "/" insert line and the block's + menu.
	let { onpick }: { onpick: (type: BlockType) => void } = $props();

	const types = Object.keys(questionKinds) as QuestionType[];
</script>

<Command.List>
	<Command.Empty class="py-3 text-center text-caption text-muted-foreground">No matching block</Command.Empty>
	<Command.Group heading="Questions">
		{#each types as type (type)}
			{@const kind = questionKinds[type]}
			<Command.Item value={kind.label} keywords={[type]} onSelect={() => onpick(type)} class="h-8 text-body-sm">
				<kind.icon class="text-muted-foreground" />
				{kind.label}
			</Command.Item>
		{/each}
	</Command.Group>
	<Command.Group heading="Layout blocks">
		<Command.Item value="New page" keywords={['page break', 'next']} onSelect={() => onpick('page_break')} class="h-8 text-body-sm">
			<FileIcon class="text-muted-foreground" />
			New page
		</Command.Item>
	</Command.Group>
</Command.List>
