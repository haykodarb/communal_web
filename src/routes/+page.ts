import { redirect } from '@sveltejs/kit';
import { supabase } from '#lib/supabase.ts';
import type { PageLoad } from './$types';

// The landing page for visitors; signed-in users (the installed app, "Open
// Communal") go straight to their Home.
export const load: PageLoad = async () => {
	const { data } = await supabase.auth.getSession();
	if (data.session) redirect(307, '/home');
};
