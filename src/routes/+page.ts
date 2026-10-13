import { redirect } from '@sveltejs/kit';
import { supabase } from '#lib/supabase.ts';
import type { PageLoad } from './$types';

// The landing page is for visitors; signed-in users go straight to Home. The
// session is stored locally, so this makes no request.
export const load: PageLoad = async () => {
	const { data } = await supabase.auth.getSession();
	if (data.session) redirect(307, '/home');
};
