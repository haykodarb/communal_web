import { me, profileLists } from '#lib/data/pages.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, depends }) => {
	const { userId } = await parent();
	const [profile, lists] = await Promise.all([me(userId, depends), profileLists(userId, depends)]);
	return { profile, lists };
};
