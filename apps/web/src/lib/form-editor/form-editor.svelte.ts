import { blankQuestions, formDefinition, formDraft, newId, type FormDraft, type QuestionType } from '@taipoo/form-core';
import { toast } from 'svelte-sonner';
import { invalidate } from '$app/navigation';
import { api } from '$lib/api';
import * as ops from './draft-ops';

type Form = { id: string; slug: string; draft: FormDraft; publishedVersionId: string | null; publishedDefinition: FormDraft | null };

// Canonical JSON for comparing definitions: parsing fixes key order and trims, as the API does on save
// (Postgres jsonb also reorders keys, so raw JSON from the database can't be compared directly).
const canonical = (d: FormDraft) => {
	const parsed = formDraft.safeParse(d);
	return parsed.success ? JSON.stringify(parsed.data) : null;
};

// The editor's state for one form: the draft being edited, autosave and publish.
// Every edit goes through a method here, so every edit schedules a save.
export class FormEditor {
	readonly id: string;
	readonly publicUrl: string; // where respondents fill in the live version
	draft: FormDraft;
	live: boolean;
	saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	publishing = $state(false);
	// The live version, as canonical JSON (null until published).
	#published = $state<string | null>(null);
	// Live, and the draft differs from what respondents see: publish to update it.
	hasChanges = $derived.by(() => this.#published !== null && canonical(this.draft) !== this.#published);
	// Where a "/" insert line is open, as an index into questions (the one at the end is always there).
	insertAt = $state<number | null>(null);
	// A block or option to focus once it renders: set when one is created or moved.
	focusId = $state<string | null>(null);

	#publishAttempted = $state(false);
	// Publish problems by path ("questions.2.title" → "Required"). Empty until the first Publish click,
	// then live, so each message clears as you fix it.
	issues = $derived.by((): Record<string, string> => {
		if (!this.#publishAttempted) return {};
		const result = formDefinition.safeParse(this.draft);
		return Object.fromEntries(result.error?.issues.map((i) => [i.path.join('.'), i.message]) ?? []);
	});

	#pending: (() => Promise<void>) | undefined;
	#timer: ReturnType<typeof setTimeout> | undefined;
	#savedTitle: string;

	constructor(form: Form) {
		this.id = form.id;
		this.publicUrl = `/f/${form.slug}`;
		this.draft = $state(form.draft);
		this.live = $state(form.publishedVersionId !== null);
		this.#published = form.publishedDefinition && canonical(form.publishedDefinition);
		this.#savedTitle = form.draft.title;
	}

	setTitle(title: string) {
		this.draft.title = title;
		this.#changed();
	}

	insert(at: number, type: QuestionType) {
		const q = blankQuestions[type](newId());
		ops.insert(this.draft, at, q);
		this.insertAt = null;
		this.focusId = q.id;
		this.#changed();
	}

	update(id: string, patch: ops.QuestionPatch) {
		ops.update(this.draft, id, patch);
		this.#changed();
	}

	remove(id: string) {
		ops.remove(this.draft, id);
		this.#changed();
	}

	duplicate(id: string) {
		this.focusId = ops.duplicate(this.draft, id) ?? null;
		this.#changed();
	}

	reorder(ids: string[]) {
		ops.reorder(this.draft, ids);
		this.#changed();
	}

	move(id: string, by: -1 | 1) {
		ops.move(this.draft, id, by);
		this.focusId = id; // moving the block's DOM node drops focus; put it back on the title
		this.#changed();
	}

	addOption(questionId: string, at: number) {
		this.focusId = ops.addOption(this.draft, questionId, at) ?? null;
		this.#changed();
	}

	updateOption(questionId: string, optionId: string, label: string) {
		ops.updateOption(this.draft, questionId, optionId, label);
		this.#changed();
	}

	removeOption(questionId: string, optionId: string) {
		this.focusId = ops.removeOption(this.draft, questionId, optionId) ?? null;
		this.#changed();
	}

	// Attachment: focuses the element when `id` is the one waiting for focus.
	focusOn = (id: string) => (el: HTMLElement) => {
		if (this.focusId !== id) return;
		el.focus();
		this.focusId = null;
	};

	// Autosave 600ms after the last edit. Each editor belongs to one form, so a save that fires after
	// you've switched forms still writes to the right one; the draft is copied when the save runs.
	#changed() {
		this.saveStatus = 'saving';
		this.#pending = () => this.#save(this.id, $state.snapshot(this.draft));
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => this.flush(), 600);
	}

	async flush() {
		clearTimeout(this.#timer);
		const run = this.#pending;
		this.#pending = undefined;
		await run?.();
	}

	async #save(id: string, draft: FormDraft) {
		const res = await api().forms[':id'].draft.$put({ param: { id }, json: draft });
		if (!res.ok) {
			this.saveStatus = 'error';
			toast.error("Couldn't save your changes. Try again.");
			return;
		}
		if (!this.#pending) this.saveStatus = 'saved'; // a newer edit is still waiting: stay "Saving…"
		if (draft.title !== this.#savedTitle) {
			this.#savedTitle = draft.title;
			await invalidate('app:forms'); // the sidebar lists the new title
		}
	}

	async publish() {
		this.#publishAttempted = true;
		if (Object.keys(this.issues).length > 0) {
			toast.error('Fix the highlighted fields before publishing');
			return;
		}
		this.publishing = true;
		await this.flush(); // publish what's on screen, not the last save
		const publishing = canonical(this.draft); // edits made while the request is in flight aren't live
		const res = await api().forms[':id'].publish.$post({ param: { id: this.id } });
		this.publishing = false;
		if (!res.ok) {
			// Rule violations come back as { error: { message, details } }; the checks above normally catch them first.
			const body = (await res.json().catch(() => null)) as unknown as { error?: { message?: string } } | null;
			toast.error(body?.error?.message ?? "Couldn't publish the form. Try again.");
			return;
		}
		const firstPublish = !this.live;
		this.live = true;
		this.#published = publishing;
		// Message only, no actions: "Open form ↗" in the header is the way to the live form.
		if (firstPublish) {
			toast.success('Your form is live', { description: 'Anyone with the link can now fill it in.' });
		} else {
			toast.success('Changes published', { description: 'Respondents now see the latest version.' });
		}
	}
}
