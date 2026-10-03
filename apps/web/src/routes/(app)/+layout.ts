import { error, redirect } from '@sveltejs/kit';
import { api } from '$lib/api';
import { authClient, loginUrl } from '$lib/auth-client';
import type { LayoutLoad } from './$types';

// The signed-in app renders in the browser only: no SEO needed, and the browser already holds the
// session cookie, so the server never has to forward it.
export const ssr = false;

// Guard for every page under (app): no session → /login, then back here after signing in.
// ponytail: client-side guard is UX only; the API's requireAuth is what actually protects the data.
export const load: LayoutLoad = async ({ url, fetch, depends }) => {
	const { data } = await authClient.getSession();
	if (!data) redirect(307, loginUrl(url));

	// The sidebar lists every form, so it loads here; `invalidate('app:forms')` refreshes it after a change.
	depends('app:forms');
	const res = await api(fetch).forms.$get();
	if (!res.ok) error(res.status, 'Could not load your forms');

	return { user: data.user, forms: await res.json() };
};
