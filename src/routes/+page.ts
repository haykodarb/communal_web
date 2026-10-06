import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// The landing page lives at /home.
export const load: PageLoad = () => redirect(307, '/home');
