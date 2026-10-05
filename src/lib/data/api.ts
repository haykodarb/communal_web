import { supabase } from '#lib/supabase.ts';
import type { Book, Community, Loan, Profile } from './models';

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
	page?: number;
	pageSize?: number;
}

export async function getBooksForUser(
	userId: string,
	{ search = '', loaned, page = 0, pageSize = 30 }: BooksQuery = {}
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
		.order('created_at', { ascending: false })
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

export async function getCommunityById(id: string): Promise<Community | null> {
	const { data, error } = await supabase
		.from('communities')
		.select('*, profiles(*)')
		.eq('id', id)
		.maybeSingle();
	if (error) throw error;
	return data ? toCommunity(data as Record<string, unknown>) : null;
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

/** Public community search by name. */
export async function searchCommunities(
	search: string,
	{ page = 0, pageSize = 30 }: CommunitiesQuery = {}
): Promise<Community[]> {
	const { data, error } = await supabase
		.from('communities')
		.select('*, profiles(*)')
		.ilike('name', `%${search}%`)
		.range(page * pageSize, page * pageSize + pageSize - 1);

	if (error) throw error;
	return (data ?? []).map((row) => toCommunity(row as Record<string, unknown>));
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
		supabase.storage.from('book_covers').remove([book.image_path]);
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
