import { env } from '$env/dynamic/private';
import { api } from '$lib/api';

// For +page.server.ts / +layout.server.ts. Server-side fetches don't go through the Vite proxy, so they
// call the API directly. No cookies are forwarded: use this for public endpoints (e.g. /api/f/:slug).
export const serverApi = (fetch: typeof globalThis.fetch) => api(fetch, env.API_URL ?? 'http://localhost:3000');
