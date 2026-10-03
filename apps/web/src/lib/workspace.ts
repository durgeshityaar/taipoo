import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';

// ponytail: one hardcoded workspace until the API has workspaces; every form lives in it.
export const workspace = { name: 'My workspace', plan: 'Free', icon: GalleryVerticalEndIcon };

// Drafts may have an empty title; anywhere a title is shown, show this instead.
export const formTitle = (title: string) => title || 'Untitled';
