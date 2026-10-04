<script lang="ts">
	import TextAlignStartIcon from '@lucide/svelte/icons/text-align-start';
	import AnswerBox from './answer-box.svelte';
	import type { EditorProps } from '.';

	let {}: EditorProps<'long_text'> = $props();
</script>

<AnswerBox icon={TextAlignStartIcon} class="h-20 items-start pt-2.5" />
