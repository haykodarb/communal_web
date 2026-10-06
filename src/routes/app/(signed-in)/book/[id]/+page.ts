import { redirect } from '@sveltejs/kit';
import { book } from '#lib/data/pages.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params, depends }) => {
	const { userId } = await parent();
	const details = await book(userId, params.id, depends);
	// Your own books live under /my-books.
	if (details.book?.owner.id === userId) redirect(307, `/app/my-books/${params.id}`);
	return { details };
};
