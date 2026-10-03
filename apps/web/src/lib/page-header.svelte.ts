import type { Snippet } from 'svelte';

// What the current page puts in the app's top bar: its breadcrumb trail and actions on the right
// (e.g. the editor's "Draft · Publish"). A page sets it in an $effect and clears it in the cleanup.
export const pageHeader = $state<{ crumbs?: string[]; actions?: Snippet }>({});
