import { error } from '@sveltejs/kit';
import { serverApi } from '$lib/server/api';
import type { PageServerLoad } from './$types';

// Public: rendered on the server so the form shows up fast, with no sign-in.
export const load: PageServerLoad = async ({ params, fetch }) => {
	const res = await serverApi(fetch).f[':slug'].$get({ param: { slug: params.slug } });
	if ((res.status as number) === 404) error(404, 'Form not found');
	if (!res.ok) error(res.status, 'Could not load the form');
	return { form: await res.json() };
};
