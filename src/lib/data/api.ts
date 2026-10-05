import { supabase } from '#lib/supabase.ts';
import type {
	AppNotification,
	Book,
	Community,
	DiscussionMessage,
	DiscussionTopic,
	Friendship,
	Loan,
	Member,
	Membership,
	Message,
	Profile
} from './models';

// The backend is untyped (no generated Database type), so rows are mapped here.

function toProfile(row: Record<string, unknown> | null | undefined): Profile {
	const r = row ?? {};
	return {
		id: (r.id as string) ?? '',
		username: (r.username as string) ?? '',
		show_email: Boolean(r.show_email),
		email: (r.email as string) ?? null,
		bio: (r.bio as string) ?? null,
		avatar_path: (r.avatar_path as string) ?? null,
		fcm_token: (r.fcm_token as string) ?? null
	};
}

export function toBook(row: Record<string, unknown>): Book {
	return {
		id: row.id as string,
		created_at: row.created_at as string,
		title: (row.title as string) ?? '',
		author: (row.author as string) ?? '',
		image_path: (row.image_path as string) ?? '',
		review: (row.review as string) ?? null,
		owner: toProfile(row.profiles as Record<string, unknown> | null),
		loaned: Boolean(row.loaned),
		public: Boolean(row.public)
	};
}

export function toCommunity(row: Record<string, unknown>): Community {
	return {
		id: row.id as string,
		name: (row.name as string) ?? '',
		description: (row.description as string) ?? null,
		image_path: (row.image_path as string) ?? null,
		owner: toProfile(row.profiles as Record<string, unknown> | null),
		user_count: (row.user_count as number) ?? 0,
		isCurrentUserAdmin: row.is_admin as boolean | undefined
	};
}

function toCommunityFromMembership(row: Record<string, unknown>): Community {
	const c = (row.communities as Record<string, unknown>) ?? {};
	return {
		id: c.id as string,
		name: (c.name as string) ?? '',
		description: (c.description as string) ?? null,
		image_path: (c.image_path as string) ?? null,
		owner: toProfile(c.profiles as Record<string, unknown> | null),
		user_count: (c.user_count as number) ?? 0,
		isCurrentUserAdmin: Boolean(row.is_admin)
	};
}

export function toLoan(row: Record<string, unknown>): Loan {
	const bookRow = row.books as Record<string, unknown> | null;
	return {
		id: row.id as string,
		created_at: row.created_at as string,
		accepted_at: (row.accepted_at as string) ?? null,
		returned_at: (row.returned_at as string) ?? null,
		rejected_at: (row.rejected_at as string) ?? null,
		latest_date: (row.latest_date as string) ?? null,
		review: (row.review as string) ?? null,
		book: bookRow ? toBook(bookRow) : toBook({}),
		owner: toProfile(row.owner_profile as Record<string, unknown> | null),
		loanee: toProfile(row.loanee_profile as Record<string, unknown> | null),
		accepted: Boolean(row.accepted),
		rejected: Boolean(row.rejected),
		returned: Boolean(row.returned)
	};
}

export async function getProfile(userId: string): Promise<Profile | null> {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.maybeSingle();
	if (error) throw error;
	return data ? toProfile(data) : null;
}

export interface BooksQuery {
	search?: string;
	loaned?: boolean;
	/** Newest first for created_at, A–Z for title/author (BooksQuery.order_by). */
	orderBy?: 'created_at' | 'title' | 'author';
	page?: number;
	pageSize?: number;
}

export async function getBooksForUser(
	userId: string,
	{ search = '', loaned, orderBy = 'created_at', page = 0, pageSize = 30 }: BooksQuery = {}
): Promise<Book[]> {
	let query = supabase
		.from('books')
		.select('*, profiles(*)')
		.eq('owner', userId);

	if (search) {
		query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
	}
	if (loaned !== undefined) {
		query = query.eq('loaned', loaned);
	}

	const { data, error } = await query
		.order(orderBy, { ascending: orderBy !== 'created_at' })
		.range(page * pageSize, page * pageSize + pageSize - 1);

	if (error) throw error;
	return (data ?? []).map((row) => toBook(row as Record<string, unknown>));
}

export async function getBookById(id: string): Promise<Book | null> {
	const { data, error } = await supabase
		.from('books')
		.select('*, profiles(*)')
		.eq('id', id)
		.maybeSingle();
	if (error) throw error;
	return data ? toBook(data as Record<string, unknown>) : null;
}

/** Also resolves whether `userId` is an admin, like CommunitiesBackend.getCommunityById. */
export async function getCommunityById(id: string, userId: string): Promise<Community | null> {
	const [community, membership] = await Promise.all([
		supabase.from('communities').select('*, profiles(*)').eq('id', id).maybeSingle(),
		supabase
			.from('memberships')
			.select('is_admin')
			.match({ member: userId, community: id, member_accepted: true, admin_accepted: true })
			.maybeSingle()
	]);
	if (community.error) throw community.error;
	if (!community.data) return null;
	return {
		...toCommunity(community.data as Record<string, unknown>),
		isCurrentUserAdmin: Boolean(membership.data?.is_admin)
	};
}

export async function getLoanById(id: string): Promise<Loan | null> {
	const { data, error } = await supabase
		.from('loans')
		.select(
			'*, books!left(*, profiles(*)), loanee_profile:profiles!loanee(*), owner_profile:profiles!owner(*)'
		)
		.eq('id', id)
		.maybeSingle();
	if (error) throw error;
	return data ? toLoan(data as Record<string, unknown>) : null;
}

export interface CommunitiesQuery {
	search?: string;
	page?: number;
	pageSize?: number;
}

/** Communities the current user is a member of. */
export async function getCommunitiesForUser(
	userId: string,
	{ page = 0, pageSize = 30 }: CommunitiesQuery = {}
): Promise<Community[]> {
	const { data, error } = await supabase
		.from('memberships')
		.select('*, communities(*, profiles(*))')
		.match({ member: userId, member_accepted: true, admin_accepted: true })
		.order('joined_at', { ascending: false })
		.range(page * pageSize, page * pageSize + pageSize - 1);

	if (error) throw error;
	return (data ?? []).map((row) =>
		toCommunityFromMembership(row as Record<string, unknown>)
	);
}

/** Loans where the user left a review (accepted loans they borrowed). */
export async function getReviewsForUser(
	userId: string,
	{ page = 0, pageSize = 30 }: { page?: number; pageSize?: number } = {}
): Promise<Loan[]> {
	const { data, error } = await supabase
		.from('loans')
		.select(
			'*, books!left(*, profiles(*)), loanee_profile:profiles!loanee(*), owner_profile:profiles!owner(*)'
		)
		.eq('accepted', true)
		.eq('loanee', userId)
		.not('book', 'is', null)
		.not('review', 'is', null)
		.range(page * pageSize, page * pageSize + pageSize - 1);
	if (error) throw error;
	return (data ?? []).map((row) => toLoan(row as Record<string, unknown>));
}

export interface LoansQuery {
	allStatus?: boolean;
	accepted?: boolean;
	returned?: boolean;
	rejected?: boolean;
	orderByDate?: boolean;
	userIsOwner?: boolean;
	userIsLoanee?: boolean;
	search?: string;
	page?: number;
	pageSize?: number;
}

export async function getLoansForUser(
	userId: string,
	{
		allStatus = true,
		accepted = false,
		returned = false,
		rejected = false,
		orderByDate = true,
		userIsOwner = true,
		userIsLoanee = true,
		search = '',
		page = 0,
		pageSize = 30
	}: LoansQuery = {}
): Promise<Loan[]> {
	let query = supabase
		.from('loans')
		.select(
			'*, books!inner(*, profiles(*)), loanee_profile:profiles!loanee(*), owner_profile:profiles!owner(*)'
		)
		.not('books', 'is', null);

	if (!allStatus) {
		query = query
			.eq('returned', returned)
			.eq('accepted', accepted)
			.eq('rejected', rejected);
	}

	if (userIsLoanee && userIsOwner) {
		query = query.or(`loanee.eq.${userId},owner.eq.${userId}`);
	} else if (userIsLoanee) {
		query = query.eq('loanee', userId);
	} else if (userIsOwner) {
		query = query.eq('owner', userId);
	}

	if (search) {
		query = query.ilike('books.title', `%${search}%`);
	}

	query = orderByDate
		? query.order('latest_date', { ascending: false })
		: query.order('title', { referencedTable: 'books', ascending: true });

	const { data, error } = await query.range(
		page * pageSize,
		page * pageSize + pageSize - 1
	);

	if (error) throw error;
	return (data ?? []).map((row) => toLoan(row as Record<string, unknown>));
}

// Storage buckets are private; the Flutter app downloads with an authenticated
// request, so on web we mint short-lived signed URLs and cache them.
const signedUrlCache = new Map<string, string>();

export async function signedStorageUrl(
	bucket: string,
	path?: string | null
): Promise<string | null> {
	if (!path) return null;
	const key = `${bucket}:${path}`;
	const cached = signedUrlCache.get(key);
	if (cached) return cached;

	const { data, error } = await supabase.storage
		.from(bucket)
		.createSignedUrl(path, 60 * 60);
	if (error || !data) return null;

	signedUrlCache.set(key, data.signedUrl);
	return data.signedUrl;
}

// ---------------------------------------------------------------------------
// Images

/**
 * Center-crops an image file to `aspect` (width / height) and re-encodes it as
 * a JPEG no wider than `maxWidth`. Stands in for the Flutter app's cropper +
 * FlutterImageCompress (quality 50).
 */
export async function processImage(
	file: Blob,
	{ aspect, maxWidth, quality = 0.5 }: { aspect: number; maxWidth: number; quality?: number }
): Promise<Blob> {
	const bitmap = await createImageBitmap(file);

	let sw = bitmap.width;
	let sh = bitmap.height;
	if (sw / sh > aspect) sw = Math.round(sh * aspect);
	else sh = Math.round(sw / aspect);
	const sx = Math.round((bitmap.width - sw) / 2);
	const sy = Math.round((bitmap.height - sh) / 2);

	const width = Math.min(sw, maxWidth);
	const height = Math.round(width / aspect);

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	canvas.getContext('2d')!.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
	bitmap.close();

	return new Promise((resolve, reject) =>
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Could not encode image.'))),
			'image/jpeg',
			quality
		)
	);
}

/** Uploads a JPEG to `/<userId>/<timestamp>.jpeg`, the path scheme the Flutter app uses. */
async function uploadImage(bucket: string, userId: string, image: Blob): Promise<string> {
	const path = `/${userId}/${Date.now()}.jpeg`;
	const { error } = await supabase.storage
		.from(bucket)
		.upload(path, image, { contentType: 'image/jpeg' });
	if (error) throw error;
	return path;
}

// ---------------------------------------------------------------------------
// Book mutations

export interface BookForm {
	title: string;
	author: string;
	review: string | null;
	public: boolean;
}

export async function addBook(userId: string, form: BookForm, cover: Blob): Promise<Book> {
	const imagePath = await uploadImage('book_covers', userId, cover);
	const { data, error } = await supabase
		.from('books')
		.insert({
			title: form.title,
			author: form.author,
			owner: userId,
			image_path: imagePath,
			public: form.public,
			review: form.review
		})
		.select('*, profiles(*)')
		.single();
	if (error) throw error;
	return toBook(data as Record<string, unknown>);
}

export async function updateBook(
	userId: string,
	book: Book,
	form: BookForm,
	cover: Blob | null
): Promise<Book> {
	const imagePath = cover ? await uploadImage('book_covers', userId, cover) : book.image_path;
	const { data, error } = await supabase
		.from('books')
		.update({
			title: form.title,
			author: form.author,
			image_path: imagePath,
			public: form.public,
			review: form.review
		})
		.eq('id', book.id)
		.select('*, profiles(*)')
		.single();
	if (error) throw error;
	return toBook(data as Record<string, unknown>);
}

export async function deleteBook(book: Book): Promise<void> {
	const { data, error } = await supabase.from('books').delete().eq('id', book.id).select();
	if (error) throw error;
	if (data && data.length > 0) {
		// Stored paths start with "/" but object names don't, and remove() only
		// matches exact names (BooksBackend.deleteBook leaves orphans this way).
		supabase.storage.from('book_covers').remove([book.image_path.replace(/^\/+/, '')]);
	}
}

// ---------------------------------------------------------------------------
// Loans for a single book

const LOAN_SELECT =
	'*, books!left(*, profiles(*)), loanee_profile:profiles!loanee(*), owner_profile:profiles!owner(*)';

/**
 * The loan currently attached to a book: an accepted loan to another user if
 * there is one, otherwise the current user's own non-rejected request.
 */
export async function getCurrentLoanForBook(
	userId: string,
	bookId: string
): Promise<Loan | null> {
	const { data, error } = await supabase
		.from('loans')
		.select(LOAN_SELECT)
		.match({ book: bookId, returned: false })
		.or(`loanee.eq.${userId}, accepted.eq.true`);
	if (error) throw error;

	const loans = (data ?? []).map((row) => toLoan(row as Record<string, unknown>));
	return (
		loans.find((loan) => loan.loanee.id !== userId && loan.accepted) ??
		loans.find((loan) => loan.loanee.id === userId && !loan.rejected) ??
		null
	);
}

/** Accepted loans of a book that left a review. */
export async function getReviewsForBook(bookId: string): Promise<Loan[]> {
	const { data, error } = await supabase
		.from('loans')
		.select(LOAN_SELECT)
		.eq('book', bookId)
		.eq('accepted', true)
		.not('review', 'is', null);
	if (error) throw error;
	return (data ?? []).map((row) => toLoan(row as Record<string, unknown>));
}

// ---------------------------------------------------------------------------
// Community + profile mutations

export interface CommunityForm {
	name: string;
	description: string | null;
}

export async function createCommunity(
	userId: string,
	form: CommunityForm,
	avatar: Blob | null
): Promise<Community> {
	const imagePath = avatar ? await uploadImage('community_avatars', userId, avatar) : null;
	const { data, error } = await supabase
		.from('communities')
		.insert({
			name: form.name,
			description: form.description,
			owner: userId,
			image_path: imagePath
		})
		.select('*, profiles(*)')
		.single();
	if (error) throw error;
	return { ...toCommunity(data as Record<string, unknown>), isCurrentUserAdmin: true };
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
	const { data, error } = await supabase
		.from('profiles')
		.select('id')
		.eq('username', username)
		.maybeSingle();
	if (error) throw error;
	return data === null;
}

export interface ProfileForm {
	username: string;
	bio: string | null;
	show_email: boolean;
}

export async function updateProfile(
	profile: Profile,
	form: ProfileForm,
	avatar: Blob | null
): Promise<Profile> {
	const avatarPath = avatar
		? await uploadImage('profile_avatars', profile.id, avatar)
		: profile.avatar_path;
	const { data, error } = await supabase
		.from('profiles')
		.update({
			username: form.username,
			show_email: form.show_email,
			bio: form.bio,
			avatar_path: avatarPath
		})
		.eq('id', profile.id)
		.select('*')
		.single();
	if (error) throw error;
	return toProfile(data);
}

// ---------------------------------------------------------------------------
// Loan mutations

export async function requestLoan(userId: string, bookId: string): Promise<Loan> {
	const { data, error } = await supabase
		.from('loans')
		.insert({ loanee: userId, book: bookId })
		.select(LOAN_SELECT)
		.single();
	if (error) throw error;
	return toLoan(data as Record<string, unknown>);
}

/** Withdraws a loan request. */
export async function deleteLoan(loanId: string): Promise<void> {
	const { data, error } = await supabase
		.from('loans')
		.delete()
		.eq('id', loanId)
		.select()
		.maybeSingle();
	if (error) throw error;
	if (!data) throw new Error('Could not withdraw this request.');
}

/** Sets one of the loan's status flags (mirrors LoansBackend.setLoanParameterTrue). */
export async function setLoanFlag(
	loanId: string,
	flag: 'accepted' | 'rejected' | 'returned'
): Promise<void> {
	const { data, error } = await supabase
		.from('loans')
		.update({ [flag]: true })
		.eq('id', loanId)
		.select()
		.maybeSingle();
	if (error) throw error;
	if (!data) throw new Error('Could not update this loan, please try again.');
}

export async function updateLoanReview(loanId: string, review: string | null): Promise<void> {
	const { data, error } = await supabase
		.from('loans')
		.update({ review })
		.eq('id', loanId)
		.select()
		.maybeSingle();
	if (error) throw error;
	if (!data) throw new Error('Could not update review.');
}

// ---------------------------------------------------------------------------
// Friendships

const FRIENDSHIP_SELECT =
	'*, requester_profile:profiles!requester(*), responder_profile:profiles!responder(*)';

function toFriendship(row: Record<string, unknown>): Friendship {
	return {
		id: row.id as number,
		created_at: row.created_at as string,
		accepted_at: (row.accepted_at as string) ?? null,
		requester: toProfile(row.requester_profile as Record<string, unknown>),
		responder: toProfile(row.responder_profile as Record<string, unknown>),
		accepted: (row.accepted as boolean | null) ?? null
	};
}

const between = (a: string, b: string) =>
	`and(requester.eq.${a},responder.eq.${b}),and(requester.eq.${b},responder.eq.${a})`;

export async function getFriendshipWith(
	userId: string,
	otherUserId: string
): Promise<Friendship | null> {
	const { data, error } = await supabase
		.from('friendships')
		.select(FRIENDSHIP_SELECT)
		.or(between(userId, otherUserId))
		.maybeSingle();
	if (error) throw error;
	return data ? toFriendship(data as Record<string, unknown>) : null;
}

export async function sendFriendRequest(userId: string, targetUserId: string): Promise<Friendship> {
	if (targetUserId === userId) throw new Error('Cannot send friend request to yourself.');
	if (await getFriendshipWith(userId, targetUserId)) throw new Error('Friendship already exists.');

	const { data, error } = await supabase
		.from('friendships')
		.insert({ requester: userId, responder: targetUserId, accepted: null })
		.select(FRIENDSHIP_SELECT)
		.single();
	if (error) throw error;
	return toFriendship(data as Record<string, unknown>);
}

export async function respondToFriendRequest(
	friendshipId: number,
	accept: boolean
): Promise<Friendship> {
	const { data, error } = await supabase
		.from('friendships')
		.update({ accepted: accept, accepted_at: 'now()' })
		.eq('id', friendshipId)
		.select(FRIENDSHIP_SELECT)
		.single();
	if (error) throw error;
	return toFriendship(data as Record<string, unknown>);
}

export async function deleteFriendship(friendshipId: number): Promise<void> {
	const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
	if (error) throw error;
}

// ---------------------------------------------------------------------------
// Memberships + notifications

export function toMembership(row: Record<string, unknown>): Membership {
	return {
		id: row.id as string,
		created_at: row.created_at as string,
		joined_at: (row.joined_at as string) ?? null,
		member: toProfile(row.profiles as Record<string, unknown>),
		community: toCommunity((row.communities as Record<string, unknown>) ?? {}),
		member_accepted: (row.member_accepted as boolean | null) ?? null,
		admin_accepted: (row.admin_accepted as boolean | null) ?? null,
		is_admin: Boolean(row.is_admin)
	};
}

const NOTIFICATION_SELECT =
	'*, type(*), receiver:profiles!receiver(*), sender:profiles!sender(*), ' +
	'loans!left(*, books!left(*, profiles(*)), loanee_profile:profiles!loanee(*), owner_profile:profiles!owner(*)), ' +
	'friendships!left(*, requester_profile:profiles!requester(*), responder_profile:profiles!responder(*))';

function toNotification(row: Record<string, unknown>): AppNotification {
	const loan = row.loans as Record<string, unknown> | null;
	const friendship = row.friendships as Record<string, unknown> | null;
	return {
		id: row.id as number,
		type: row.type as AppNotification['type'],
		updated_at: row.updated_at as string,
		seen: Boolean(row.seen),
		sender: row.sender ? toProfile(row.sender as Record<string, unknown>) : null,
		receiver: toProfile(row.receiver as Record<string, unknown>),
		loan: loan ? toLoan(loan) : null,
		friendship: friendship ? toFriendship(friendship) : null
	};
}

export async function getNotifications(
	userId: string,
	{ page = 0, pageSize = 20 }: { page?: number; pageSize?: number } = {}
): Promise<AppNotification[]> {
	const { data, error } = await supabase
		.from('notifications')
		.select(NOTIFICATION_SELECT)
		.eq('receiver', userId)
		.order('updated_at', { ascending: false })
		.range(page * pageSize, page * pageSize + pageSize - 1);
	if (error) throw error;
	return (data ?? []).map((row) => toNotification(row as unknown as Record<string, unknown>));
}

export async function getNotificationById(id: number): Promise<AppNotification | null> {
	const { data, error } = await supabase
		.from('notifications')
		.select(NOTIFICATION_SELECT)
		.eq('id', id)
		.maybeSingle();
	if (error) throw error;
	return data ? toNotification(data as unknown as Record<string, unknown>) : null;
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
	const { count, error } = await supabase
		.from('notifications')
		.select('*', { count: 'exact', head: true })
		.eq('receiver', userId)
		.eq('seen', false);
	if (error) throw error;
	return count ?? 0;
}

export async function setNotificationsRead(userId: string): Promise<void> {
	const { error } = await supabase
		.from('notifications')
		.update({ seen: true })
		.eq('receiver', userId)
		.eq('seen', false);
	if (error) throw error;
}

// ---------------------------------------------------------------------------
// Messages

const MESSAGE_SELECT =
	'*, receiver_profile:profiles!receiver(*), sender_profile:profiles!sender(*)';

function toMessage(row: Record<string, unknown>): Message {
	return {
		id: row.id as string,
		created_at: row.created_at as string,
		sender: toProfile(row.sender_profile as Record<string, unknown>),
		receiver: toProfile(row.receiver_profile as Record<string, unknown>),
		content: (row.content as string) ?? '',
		is_read: Boolean(row.is_read),
		unread_messages: (row.unread_messages as number | null) ?? null
	};
}

const chatWith = (a: string, b: string) =>
	`and(sender.eq.${a},receiver.eq.${b}),and(sender.eq.${b},receiver.eq.${a})`;

/**
 * Latest message of each conversation. distinct_chats has a row per
 * direction, so keep only the newer row of each sender/receiver pair.
 */
export async function getChats(): Promise<Message[]> {
	const { data, error } = await supabase
		.from('distinct_chats')
		.select(MESSAGE_SELECT)
		.order('created_at', { ascending: false });
	if (error) throw error;

	const chats = (data ?? []).map((row) => toMessage(row as Record<string, unknown>));
	return chats.filter(
		(chat) =>
			!chats.some(
				(other) =>
					other.sender.id === chat.receiver.id &&
					other.receiver.id === chat.sender.id &&
					other.created_at > chat.created_at
			)
	);
}

export async function getUnreadChatCount(userId: string): Promise<number> {
	const { count, error } = await supabase
		.from('distinct_chats')
		.select('id', { count: 'exact', head: true })
		.match({ receiver: userId, is_read: false });
	if (error) throw error;
	return count ?? 0;
}

/** Newest first, 100 per page like MessagesBackend.getMessagesWithUser. */
export async function getMessagesWith(
	userId: string,
	otherUserId: string,
	page = 0
): Promise<Message[]> {
	const { data, error } = await supabase
		.from('messages')
		.select(MESSAGE_SELECT)
		.or(chatWith(userId, otherUserId))
		.order('created_at', { ascending: false })
		.range(page * 100, page * 100 + 99);
	if (error) throw error;
	return (data ?? []).map((row) => toMessage(row as Record<string, unknown>));
}

export async function getMessageById(id: string): Promise<Message | null> {
	const { data, error } = await supabase
		.from('messages')
		.select(MESSAGE_SELECT)
		.eq('id', id)
		.maybeSingle();
	if (error) throw error;
	return data ? toMessage(data as Record<string, unknown>) : null;
}

export async function sendMessage(
	userId: string,
	receiverId: string,
	content: string
): Promise<Message> {
	const { data, error } = await supabase
		.from('messages')
		.insert({ sender: userId, receiver: receiverId, content })
		.select(MESSAGE_SELECT)
		.single();
	if (error) throw error;
	return toMessage(data as Record<string, unknown>);
}

export async function markMessagesRead(userId: string, otherUserId: string): Promise<void> {
	const { error } = await supabase
		.from('messages')
		.update({ is_read: true })
		.or(chatWith(userId, otherUserId))
		.eq('is_read', false)
		.eq('receiver', userId);
	if (error) throw error;
}

export async function deleteChatWith(otherUserId: string): Promise<void> {
	const { error } = await supabase.rpc('delete_chat_for_user', { chatter_id: otherUserId });
	if (error) throw error;
}

// ---------------------------------------------------------------------------
// Community books, members and requests

/** get_books_community RPC: books shared in a community, newest first. */
export async function getBooksInCommunity(
	communityId: string,
	{ search = '', page = 0, pageSize = 30 }: { search?: string; page?: number; pageSize?: number } = {}
): Promise<Book[]> {
	const { data, error } = await supabase
		.rpc('get_books_community', {
			community_id: communityId,
			offset_num: page * pageSize,
			limit_num: pageSize,
			search_query: search
		})
		.select('*, profiles(*)')
		.order('created_at', { ascending: false })
		.limit(pageSize);
	if (error) throw error;
	return ((data ?? []) as Record<string, unknown>[]).map(toBook);
}

/** Accepted members whose username matches `search`. */
export async function getCommunityMembers(
	communityId: string,
	{ search = '', page = 0, pageSize = 20 }: { search?: string; page?: number; pageSize?: number } = {}
): Promise<Member[]> {
	// !inner so the username filter drops non-matching memberships rather than
	// returning them with a null profile.
	const { data, error } = await supabase
		.from('memberships')
		.select('is_admin, profiles!inner(*)')
		.match({ community: communityId, member_accepted: true, admin_accepted: true })
		.ilike('profiles.username', `%${search}%`)
		.range(page * pageSize, page * pageSize + pageSize - 1);
	if (error) throw error;
	return (data ?? []).map((row) => ({
		...toProfile(row.profiles as unknown as Record<string, unknown>),
		is_admin: Boolean(row.is_admin)
	}));
}

export async function setMemberAdmin(
	communityId: string,
	userId: string,
	isAdmin: boolean
): Promise<void> {
	const { data, error } = await supabase
		.from('memberships')
		.update({ is_admin: isAdmin })
		.match({ member: userId, community: communityId })
		.select();
	if (error) throw error;
	if (!data?.length) throw new Error('Could not update member.');
}

export async function removeMember(communityId: string, userId: string): Promise<void> {
	const { data, error } = await supabase
		.from('memberships')
		.delete()
		.match({ member: userId, community: communityId })
		.select();
	if (error) throw error;
	if (!data?.length) throw new Error('Could not remove member.');
}

export async function leaveCommunity(communityId: string, userId: string): Promise<void> {
	const { data, error } = await supabase
		.from('memberships')
		.delete()
		.match({ member: userId, community: communityId, member_accepted: true })
		.select()
		.maybeSingle();
	if (error) throw error;
	if (!data) throw new Error('Could not leave community.');
}

const MEMBERSHIP_SELECT = '*, communities(*, profiles(*)), profiles(*)';

/** Pending join requests (member asked, admins haven't answered). */
export async function getMembershipRequests(communityId: string): Promise<Membership[]> {
	const { data, error } = await supabase
		.from('memberships')
		.select(MEMBERSHIP_SELECT)
		.is('admin_accepted', null)
		.match({ community: communityId, member_accepted: true });
	if (error) throw error;
	return (data ?? []).map((row) => toMembership(row as Record<string, unknown>));
}

export async function getMembershipRequestCount(communityId: string): Promise<number> {
	const { count, error } = await supabase
		.from('memberships')
		.select('id', { count: 'exact', head: true })
		.is('admin_accepted', null)
		.match({ community: communityId, member_accepted: true });
	if (error) throw error;
	return count ?? 0;
}

export async function respondToMembershipRequest(
	membershipId: string,
	accept: boolean
): Promise<void> {
	const { error } = await supabase
		.from('memberships')
		.update({ admin_accepted: accept, joined_at: accept ? 'now()' : null })
		.eq('id', membershipId);
	if (error) throw error;
}

/** The user's membership row for a community, in any state. */
export async function getMembership(
	communityId: string,
	userId: string
): Promise<Membership | null> {
	const { data, error } = await supabase
		.from('memberships')
		.select(MEMBERSHIP_SELECT)
		.match({ community: communityId, member: userId })
		.maybeSingle();
	if (error) throw error;
	return data ? toMembership(data as Record<string, unknown>) : null;
}

/** Ask to join a community; admins then accept or reject. */
export async function requestToJoin(communityId: string, userId: string): Promise<Membership> {
	const { data, error } = await supabase
		.from('memberships')
		.insert({ member: userId, community: communityId, is_admin: false, member_accepted: true })
		.select(MEMBERSHIP_SELECT)
		.single();
	if (error) throw error;
	return toMembership(data as Record<string, unknown>);
}

/** get_users_not_in_community RPC, used by the invite page. */
export async function searchUsersNotInCommunity(
	communityId: string,
	search: string,
	page = 0
): Promise<Profile[]> {
	const { data, error } = await supabase.rpc('get_users_not_in_community', {
		community_id: communityId,
		search_query: search,
		offset_num: page * 20,
		limit_num: 20
	});
	if (error) throw error;
	return ((data ?? []) as Record<string, unknown>[]).map(toProfile);
}

/** Invite a user (admin side); returns the membership id so the invite can be undone. */
export async function inviteToCommunity(communityId: string, userId: string): Promise<string> {
	const { data, error } = await supabase
		.from('memberships')
		.insert({
			member: userId,
			community: communityId,
			is_admin: false,
			admin_accepted: true,
			member_accepted: null
		})
		.select('id')
		.single();
	if (error) throw error;
	return data.id as string;
}

export async function cancelInvite(membershipId: string): Promise<void> {
	const { error } = await supabase.from('memberships').delete().eq('id', membershipId);
	if (error) throw error;
}

/** Invitations the user hasn't answered yet. */
export async function getInvitations(userId: string): Promise<Membership[]> {
	const { data, error } = await supabase
		.from('memberships')
		.select(MEMBERSHIP_SELECT)
		.eq('member', userId)
		.is('member_accepted', null);
	if (error) throw error;
	return (data ?? []).map((row) => toMembership(row as Record<string, unknown>));
}

export async function updateCommunity(
	userId: string,
	community: Community,
	form: CommunityForm,
	avatar: Blob | null
): Promise<Community> {
	const imagePath = avatar
		? await uploadImage('community_avatars', userId, avatar)
		: community.image_path;
	const { data, error } = await supabase
		.from('communities')
		.update({ name: form.name, description: form.description, image_path: imagePath })
		.eq('id', community.id)
		.select('*, profiles(*)')
		.single();
	if (error) throw error;
	return {
		...toCommunity(data as Record<string, unknown>),
		isCurrentUserAdmin: community.isCurrentUserAdmin
	};
}

export async function deleteCommunity(communityId: string): Promise<void> {
	const { error } = await supabase.from('communities').delete().eq('id', communityId);
	if (error) throw error;
}

// ---------------------------------------------------------------------------
// Discussions

const TOPIC_SELECT =
	'*, profiles(*), communities(*, profiles(*)), last_message(*, profiles(*))';

function toDiscussionMessage(row: Record<string, unknown>): DiscussionMessage {
	return {
		id: row.id as string,
		created_at: row.created_at as string,
		sender: toProfile(row.profiles as Record<string, unknown>),
		content: (row.content as string) ?? '',
		topicId: row.topic as string
	};
}

function toTopic(row: Record<string, unknown>): DiscussionTopic {
	const last = row.last_message as Record<string, unknown> | null;
	return {
		id: row.id as string,
		created_at: row.created_at as string,
		creator: toProfile(row.profiles as Record<string, unknown>),
		community: toCommunity((row.communities as Record<string, unknown>) ?? {}),
		name: (row.name as string) ?? '',
		last_message: last ? toDiscussionMessage(last) : null
	};
}

export async function getTopics(
	communityId: string,
	{ search = '', page = 0, pageSize = 20 }: { search?: string; page?: number; pageSize?: number } = {}
): Promise<DiscussionTopic[]> {
	const { data, error } = await supabase
		.from('discussion_topics')
		.select(TOPIC_SELECT)
		.eq('community', communityId)
		.ilike('name', `%${search}%`)
		.range(page * pageSize, page * pageSize + pageSize - 1);
	if (error) throw error;
	return ((data ?? []) as unknown as Record<string, unknown>[]).map(toTopic);
}

export async function getTopicById(id: string): Promise<DiscussionTopic | null> {
	const { data, error } = await supabase
		.from('discussion_topics')
		.select(TOPIC_SELECT)
		.eq('id', id)
		.maybeSingle();
	if (error) throw error;
	return data ? toTopic(data as unknown as Record<string, unknown>) : null;
}

export async function createTopic(
	userId: string,
	communityId: string,
	name: string
): Promise<DiscussionTopic> {
	const { data, error } = await supabase
		.from('discussion_topics')
		.insert({ creator: userId, community: communityId, name })
		.select('*, profiles(*), communities(*, profiles(*))')
		.single();
	if (error) throw error;
	return toTopic(data as Record<string, unknown>);
}

/** Newest first. */
export async function getTopicMessages(topicId: string): Promise<DiscussionMessage[]> {
	const { data, error } = await supabase
		.from('discussion_messages')
		.select('*, profiles(*)')
		.eq('topic', topicId)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data ?? []).map((row) => toDiscussionMessage(row as Record<string, unknown>));
}

export async function getTopicMessageById(id: string): Promise<DiscussionMessage | null> {
	const { data, error } = await supabase
		.from('discussion_messages')
		.select('*, profiles(*)')
		.eq('id', id)
		.maybeSingle();
	if (error) throw error;
	return data ? toDiscussionMessage(data as Record<string, unknown>) : null;
}

export async function sendTopicMessage(
	userId: string,
	topicId: string,
	content: string
): Promise<DiscussionMessage> {
	const { data, error } = await supabase
		.from('discussion_messages')
		.insert({ sender: userId, topic: topicId, content })
		.select('*, profiles(*)')
		.single();
	if (error) throw error;
	return toDiscussionMessage(data as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// Search

/** get_books_friends_of_friends RPC: books from your friends' circle (search's Books tab). */
export async function searchFriendsBooks(
	search: string,
	{ page = 0, pageSize = 20 }: { page?: number; pageSize?: number } = {}
): Promise<Book[]> {
	const { data, error } = await supabase
		.rpc('get_books_friends_of_friends', {
			offset_num: page * pageSize,
			limit_num: pageSize,
			search_query: search
		})
		.select('*, profiles(*)')
		.order('created_at', { ascending: false })
		.limit(pageSize);
	if (error) throw error;
	return ((data ?? []) as Record<string, unknown>[]).map(toBook);
}

/** Everyone except the current user whose username matches. */
export async function searchUsers(
	userId: string,
	search: string,
	{ page = 0, pageSize = 20 }: { page?: number; pageSize?: number } = {}
): Promise<Profile[]> {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.neq('id', userId)
		.ilike('username', `%${search}%`)
		.range(page * pageSize, page * pageSize + pageSize - 1);
	if (error) throw error;
	return (data ?? []).map((row) => toProfile(row as Record<string, unknown>));
}
