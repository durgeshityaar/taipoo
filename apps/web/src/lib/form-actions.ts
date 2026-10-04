import { toast } from 'svelte-sonner';
import { goto, invalidate } from '$app/navigation';
import { page } from '$app/state';
import { api } from '$lib/api';
import { openEditor } from '$lib/form-editor/form-editor.svelte';

// What you can do to a form from outside its editor (the sidebar's ⋯ menu). The form open in the editor is
// handled through the editor (see openEditor), so unsaved edits are kept and its autosave stays correct.
// Toasts are messages only.

// A new blank, untitled form, then straight into its editor.
export async function createForm() {
	const res = await api().forms.$post({ json: {} });
	if (!res.ok) return void toast.error("Couldn't create the form. Try again.");
	const form = await res.json();
	await invalidate('app:forms');
	await goto(`/forms/${form.id}/edit`);
}

export const publicUrl = (slug: string) => `${location.origin}/f/${slug}`;

export async function copyLink(slug: string) {
	await navigator.clipboard.writeText(publicUrl(slug));
	toast.success('Link copied');
}

export async function renameForm(id: string, title: string) {
	const editor = openEditor.current;
	if (editor?.id === id) return editor.setTitle(title); // autosaves, and refreshes the sidebar

	const forms = api().forms[':id'];
	const res = await forms.$get({ param: { id } });
	const saved = res.ok && (await forms.draft.$put({ param: { id }, json: { ...(await res.json()).draft, title } })).ok;
	if (!saved) return void toast.error("Couldn't rename the form. Try again.");
	await invalidate('app:forms');
}

// A new, unpublished form with the same questions. Stays where you are.
export async function duplicateForm(id: string) {
	const editor = openEditor.current;
	if (editor?.id === id) await editor.flush(); // copy what's on screen

	const res = await api().forms[':id'].$get({ param: { id } });
	if (!res.ok) return void toast.error("Couldn't duplicate the form. Try again.");
	const { draft } = await res.json();
	const created = await api().forms.$post({ json: { draft: { ...draft, title: `${draft.title || 'Untitled'} (copy)` } } });
	if (!created.ok) return void toast.error("Couldn't duplicate the form. Try again.");
	await invalidate('app:forms');
	toast.success('Form duplicated');
}

export async function deleteForm(id: string) {
	const editor = openEditor.current;
	if (editor?.id === id) editor.discard(); // nothing left to save to

	const res = await api().forms[':id'].$delete({ param: { id } });
	if (!res.ok) return void toast.error("Couldn't delete the form. Try again.");
	if (page.url.pathname.startsWith(`/forms/${id}/`)) await goto('/dashboard'); // its editor or results
	await invalidate('app:forms');
	toast.success('Form deleted');
}
