import { networkBooks, SEARCH_TABS, users } from '#lib/data/pages.ts';
import { tabFrom } from '#lib/tabs.ts';
import type { PageLoad } from './$types';

// The tab (?tab=users) picks which list is loaded and cached.
export const load: PageLoad = async ({ parent, url, depends }) => {
	const tab = tabFrom(url, SEARCH_TABS);
	if (tab === 'users') {
		const { userId } = await parent();
		return { tab, users: await users(userId, depends), books: undefined };
	}
	return { tab, books: await networkBooks(depends), users: undefined };
};
