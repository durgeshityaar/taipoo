import { error } from '@sveltejs/kit';
import { api } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const forms = api(fetch).forms[':id'];
	const [formRes, pageRes] = await Promise.all([
		forms.$get({ param: { id: params.id } }),
		forms.responses.$get({ param: { id: params.id }, query: {} })
	]);
	// 400 = malformed id; both it and 404 (missing or someone else's form) mean "no such form" here.
	const status = formRes.status as number;
	if (status === 400 || status === 404) error(404, 'Form not found');
	if (!formRes.ok || !pageRes.ok) error(formRes.ok ? pageRes.status : status, 'Could not load the results');
	return { form: await formRes.json(), responses: await pageRes.json() };
};
