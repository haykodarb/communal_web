import { myLoans } from '#lib/data/pages.ts';
import { queryOf } from '#lib/url-state.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, depends, url }) => {
	const { userId } = await parent();
	return { loans: await myLoans(userId, depends), query: queryOf(url) };
};
