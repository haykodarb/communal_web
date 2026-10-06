import { cached, peek } from '#lib/cache.ts';
import { firstPages, type PagedState } from '#lib/paged.svelte.ts';
import {
	getBookById,
	getBooksForUser,
	getChats,
	getCurrentLoanForBook,
	getFriendships,
	getFriendshipWith,
	getLoanById,
	getLoansForUser,
	getMessagesWith,
	getMutualFriends,
	getNotifications,
	getProfile,
	getReviewsForBook,
	getReviewsForUser,
	isOnWaitlist,
	presignStorageUrls,
	searchNetworkBooks,
	searchUsers,
	type FriendshipList
} from './api';
import type { Book, Friendship, Loan, NetworkBook, Profile } from './models';

// Data for each page, fetched by its load function through the page cache.
// Lists keep every page loaded so far (see createPaged's onChange), so going
// back to a list restores it whole, scroll position included.

type Depends = (...deps: `${string}:${string}`[]) => void;

export const PAGE_SIZE = {
	books: 30,
	loans: 30,
	network: 20,
	friends: 30,
	notifications: 20,
	profileLists: 30,
	bookReviews: 5
};

/** The Friends page's tabs, in order (the first is the bare URL). */
export const FRIEND_TABS = ['friends', 'received', 'sent'] as const satisfies FriendshipList[];

/** Search's tabs. */
export const SEARCH_TABS = ['books', 'users'] as const;

/** Profile tabs. */
export const PROFILE_TABS = ['books', 'reviews'] as const;

/** Cache keys; mutations and realtime changes drop them by prefix (see api.ts). */
export const keys = {
	myBooks: (userId: string) => `books:${userId}`,
	book: (id: string) => `book:${id}`,
	/** Shares the `book:` prefix so review changes drop it too. */
	bookReviews: (id: string) => `book:${id}:reviews`,
	loans: (userId: string) => `loans:${userId}`,
	loan: (id: string) => `loan:${id}`,
	network: () => 'network',
	users: () => 'users',
	friends: (list: FriendshipList) => `friends:${list}`,
	notifications: () => 'notifications',
	chats: () => 'chats',
	chat: (otherId: string) => `chat:${otherId}`,
	me: (userId: string) => `me:${userId}`,
	profile: (id: string) => `profile:${id}`,
	profileBooks: (id: string) => `profile-books:${id}`,
	profileReviews: (id: string) => `profile-reviews:${id}`
};

const covers = (books: Book[]) =>
	presignStorageUrls(
		'book_covers',
		books.map((b) => b.image_path)
	);
const avatars = (profiles: Profile[]) =>
	presignStorageUrls(
		'profile_avatars',
		profiles.map((p) => p.avatar_path)
	);

/** A cached list: the first page, or a refresh of every page the cache holds. */
function list<T>(
	key: string,
	pageSize: number,
	load: (page: number, pageSize: number) => Promise<T[]>,
	presign: (items: T[]) => Promise<void>,
	depends: Depends
): Promise<PagedState<T>> {
	return cached(
		key,
		async () => {
			const state = await firstPages(load, pageSize, peek<PagedState<T>>(key));
			await presign(state.items);
			return state;
		},
		depends
	);
}

export const myBooks = (userId: string, depends: Depends) =>
	list<Book>(
		keys.myBooks(userId),
		PAGE_SIZE.books,
		(page, pageSize) => getBooksForUser(userId, { page, pageSize }),
		covers,
		depends
	);

export const myLoans = (userId: string, depends: Depends) =>
	list<Loan>(
		keys.loans(userId),
		PAGE_SIZE.loans,
		(page, pageSize) => getLoansForUser(userId, { page, pageSize }),
		(loans) => covers(loans.map((l) => l.book)),
		depends
	);

export const networkBooks = (depends: Depends) =>
	list<NetworkBook>(
		keys.network(),
		PAGE_SIZE.network,
		(page, pageSize) => searchNetworkBooks('', { page, pageSize }),
		covers,
		depends
	);

/** Search's Users tab, unfiltered. */
export const users = (userId: string, depends: Depends) =>
	list<Profile>(
		keys.users(),
		PAGE_SIZE.network,
		(page, pageSize) => searchUsers(userId, '', { page, pageSize }),
		avatars,
		depends
	);

export const friendships = (userId: string, which: FriendshipList, depends: Depends) =>
	list<Friendship>(
		keys.friends(which),
		PAGE_SIZE.friends,
		(page, pageSize) => getFriendships(userId, which, { page, pageSize }),
		(rows) => avatars(rows.flatMap((f) => [f.requester, f.responder])),
		depends
	);

/** Notifications aren't marked read here (preloading must not do that). */
export const notifications = (userId: string, depends: Depends) =>
	list(
		keys.notifications(),
		PAGE_SIZE.notifications,
		(page, pageSize) => getNotifications(userId, { page, pageSize }),
		async () => {},
		depends
	);

export const chats = (depends: Depends) =>
	cached(
		keys.chats(),
		async () => {
			const rows = await getChats();
			await avatars(rows.flatMap((m) => [m.sender, m.receiver]));
			return rows;
		},
		depends
	);

/** The other person and the newest page of messages (newest first). */
export const chat = (userId: string, otherId: string, depends: Depends) =>
	cached(
		keys.chat(otherId),
		async () => {
			const [chatter, messages] = await Promise.all([
				getProfile(otherId),
				getMessagesWith(userId, otherId, 0)
			]);
			if (chatter) await avatars([chatter]);
			return { chatter, messages };
		},
		depends
	);

/** Your own profile. */
export const me = (userId: string, depends: Depends) =>
	cached(
		keys.me(userId),
		async () => {
			const found = await getProfile(userId);
			if (found) await avatars([found]);
			return found;
		},
		depends
	);

/** Someone else's profile with your friendship and mutual friends. */
export const profile = (userId: string, id: string, depends: Depends) =>
	cached(
		keys.profile(id),
		async () => {
			const [person, friendship, mutual] = await Promise.all([
				getProfile(id),
				getFriendshipWith(userId, id),
				getMutualFriends(id)
			]);
			if (person) await avatars([person]);
			return { profile: person, friendship, mutual };
		},
		depends
	);

/** The Books and Reviews tabs of a profile (ProfileView). */
export const profileLists = (id: string, depends: Depends) =>
	Promise.all([
		list<Book>(
			keys.profileBooks(id),
			PAGE_SIZE.profileLists,
			(page, pageSize) => getBooksForUser(id, { page, pageSize }),
			covers,
			depends
		),
		list<Loan>(
			keys.profileReviews(id),
			PAGE_SIZE.profileLists,
			(page, pageSize) => getReviewsForUser(id, { page, pageSize }),
			(loans) => avatars(loans.map((l) => l.loanee)),
			depends
		)
	]).then(([books, reviews]) => ({ books, reviews }));

/** A book with its current loan for you, its reviews and your waitlist entry. */
export const book = (userId: string, id: string, depends: Depends) =>
	cached(
		keys.book(id),
		async () => {
			const [found, currentLoan, reviews, waitlisted] = await Promise.all([
				getBookById(id),
				getCurrentLoanForBook(userId, id),
				list<Loan>(
					keys.bookReviews(id),
					PAGE_SIZE.bookReviews,
					(page, pageSize) => getReviewsForBook(id, { page, pageSize }),
					(loans) => avatars(loans.map((l) => l.loanee)),
					depends
				),
				isOnWaitlist(userId, id)
			]);
			if (found) await covers([found]);
			return { book: found, currentLoan, reviews, waitlisted };
		},
		depends
	);

export const loan = (id: string, depends: Depends) =>
	cached(
		keys.loan(id),
		async () => {
			const found = await getLoanById(id);
			if (found) await Promise.all([covers([found.book]), avatars([found.loanee])]);
			return found;
		},
		depends
	);
