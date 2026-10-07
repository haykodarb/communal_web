import { FRIEND_TABS, friendships } from '#lib/data/pages.ts';
import { tabFrom } from '#lib/tabs.ts';
import type { PageLoad } from './$types';

// The tab (?tab=received / sent) picks which list is loaded and cached.
export const load: PageLoad = async ({ parent, url, depends }) => {
	const { userId } = await parent();
	const list = tabFrom(url, FRIEND_TABS);
	return { list, state: await friendships(userId, list, depends) };
};
