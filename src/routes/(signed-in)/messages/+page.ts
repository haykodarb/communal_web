import { chats } from '#lib/data/pages.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => ({ chats: await chats(depends) });
