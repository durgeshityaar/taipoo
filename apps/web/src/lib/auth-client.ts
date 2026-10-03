import { createAuthClient } from 'better-auth/svelte';

// Better Auth client for the browser: authClient.signUp.email(), .signIn.email(), .signOut(),
// .useSession() (a reactive store), .getSession(). No baseURL: it defaults to this origin's /api/auth,
// which the dev proxy forwards to the API.
export const authClient = createAuthClient();

// Where to go after signing in: the `?redirectTo=` path when it's a path on this site, else the dashboard.
// Anything else ("//evil.com", "/\evil.com", "https://…") is ignored so the param can't be an open redirect.
export function redirectTarget(url: URL) {
	const to = url.searchParams.get('redirectTo');
	return to && to.startsWith('/') && !['/', '\\'].includes(to[1] ?? '') ? to : '/dashboard';
}

// /login?redirectTo=<current page>, used when a signed-out visitor hits a signed-in page.
export const loginUrl = (from: URL) => `/login?redirectTo=${encodeURIComponent(from.pathname + from.search)}`;
