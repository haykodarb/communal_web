import { redirect } from '@sveltejs/kit';
import { supabase } from '#lib/supabase.ts';
import type { LayoutLoad } from './$types';

// Every signed-in page's load needs the user, so resolve the session (stored
// locally, no request) once here; pages read it with `await parent()`.
export const load: LayoutLoad = async () => {
	const { data } = await supabase.auth.getSession();
	if (!data.session) redirect(307, '/auth');
	return { userId: data.session.user.id };
};
