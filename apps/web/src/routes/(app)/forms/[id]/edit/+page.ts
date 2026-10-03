import { error } from '@sveltejs/kit';
import { api } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await api(fetch).forms[':id'].$get({ param: { id: params.id } });
	// 400 = malformed id; both it and 404 (missing or someone else's form) mean "no such form" here.
	const status = res.status as number;
	if (status === 400 || status === 404) error(404, 'Form not found');
	if (!res.ok) error(status, 'Could not load the form');
	return { form: await res.json() };
};
