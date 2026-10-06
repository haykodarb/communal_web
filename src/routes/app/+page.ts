import { redirect } from '@sveltejs/kit';
import { supabase } from '#lib/supabase.ts';
import type { PageLoad } from './$types';

// The app's front door (the landing page's "Open Communal", the installed
// app's start page): your books when signed in, the sign-in page otherwise.
export const load: PageLoad = async () => {
	const { data } = await supabase.auth.getSession();
	redirect(307, data.session ? '/app/my-books' : '/app/auth');
};
