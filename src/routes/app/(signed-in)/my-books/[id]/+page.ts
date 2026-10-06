import { book } from '#lib/data/pages.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params, depends }) => {
	const { userId } = await parent();
	return { details: await book(userId, params.id, depends) };
};
