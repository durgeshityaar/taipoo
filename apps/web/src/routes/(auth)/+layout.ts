import { redirect } from '@sveltejs/kit';
import { authClient, redirectTarget } from '$lib/auth-client';
import type { LayoutLoad } from './$types';

// Auth pages render in the browser only: the session lives in a cookie the browser sends to /api/auth.
export const ssr = false;

// Already signed in? Skip login/signup and go where you were headed.
export const load: LayoutLoad = async ({ url }) => {
	const { data } = await authClient.getSession();
	if (data) redirect(307, redirectTarget(url));
};
