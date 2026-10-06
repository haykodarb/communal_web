import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// The app used to live at the site root (/my-books, /auth/reset, ...). Send
// those URLs (bookmarks, emails already sent, installed apps) to /app.
const MOVED = [
	'my-books',
	'loans',
	'search',
	'friends',
	'notifications',
	'messages',
	'my-profile',
	'profile',
	'book',
	'communities',
	'auth'
];

export const load: PageLoad = ({ params, url }) => {
	if (MOVED.includes(params.legacy.split('/')[0])) {
		redirect(308, `/app/${params.legacy}${url.search}${url.hash}`);
	}
	error(404, 'Not found');
};
