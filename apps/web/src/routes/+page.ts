import { redirect } from '@sveltejs/kit';

// No landing page yet: "/" goes to the dashboard, whose guard sends signed-out visitors to /login.
export const load = () => redirect(307, '/dashboard');
