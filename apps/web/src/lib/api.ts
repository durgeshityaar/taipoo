import { hcWithType } from 'api/client';

// Typed API client: `api(fetch).forms.$get()`, `api(fetch).f[':slug'].$get({ param: { slug } })` …
// Route paths, inputs and JSON outputs are all inferred from the API's Hono app (AppType).
//
// In the browser the default base "" means same-origin /api/*, which the Vite dev proxy (or the production
// reverse proxy) forwards to the API, with the session cookie attached. Pass SvelteKit's `fetch` in load
// functions. Server-side code must use `serverApi` from $lib/server/api instead: it needs the API's real URL.
export const api = (fetch: typeof globalThis.fetch = globalThis.fetch, baseUrl = '') =>
	hcWithType(baseUrl, { fetch }).api;
