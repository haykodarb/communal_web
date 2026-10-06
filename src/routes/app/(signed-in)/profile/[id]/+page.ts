import { redirect } from '@sveltejs/kit';
import { profile, profileLists } from '#lib/data/pages.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params, depends }) => {
	const { userId } = await parent();
	// Your own profile has its own page.
	if (params.id === userId) redirect(307, '/app/my-profile');
	const [person, lists] = await Promise.all([
		profile(userId, params.id, depends),
		profileLists(params.id, depends)
	]);
	return { person, lists };
};
