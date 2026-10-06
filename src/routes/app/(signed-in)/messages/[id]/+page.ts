import { chat } from '#lib/data/pages.ts';
import type { PageLoad } from './$types';

// Fetch only; messages are marked read when the chat is actually opened.
export const load: PageLoad = async ({ parent, params, depends }) => {
	const { userId } = await parent();
	return { chat: await chat(userId, params.id, depends) };
};
