import { notifications } from '#lib/data/pages.ts';
import type { PageLoad } from './$types';

// Only fetches: marking them read happens when the page is actually opened, so
// preloading (hovering the link) doesn't clear the badge.
export const load: PageLoad = async ({ parent, depends }) => {
	const { userId } = await parent();
	return { notifications: await notifications(userId, depends) };
};
