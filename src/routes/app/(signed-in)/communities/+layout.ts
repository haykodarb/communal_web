import { redirect } from '@sveltejs/kit';
import { COMMUNITIES_ENABLED } from '#lib/features.ts';
import type { LayoutLoad } from './$types';

// Disabled for now (see #lib/features.ts): the pages are kept, not reachable.
export const load: LayoutLoad = () => {
	if (!COMMUNITIES_ENABLED) redirect(307, '/app/my-books');
};
