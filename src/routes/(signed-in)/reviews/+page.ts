import { friendReviews } from '#lib/data/pages.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, depends }) => {
	const { userId } = await parent();
	return { userId, reviews: await friendReviews(userId, depends) };
};
