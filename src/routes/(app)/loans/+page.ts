import { myLoans } from '#lib/data/pages.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, depends }) => {
	const { userId } = await parent();
	return { loans: await myLoans(userId, depends) };
};
