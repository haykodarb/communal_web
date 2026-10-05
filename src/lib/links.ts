import { auth } from './auth.svelte';
import type { Book, Profile } from './data/models';

// Own books/profile have their own pages, mirroring the Flutter routes.

export function bookHref(book: Book): string {
	return book.owner.id === auth.user?.id ? `/my-books/${book.id}` : `/book/${book.id}`;
}

export function profileHref(profile: Profile): string {
	return profile.id === auth.user?.id ? '/my-profile' : `/profile/${profile.id}`;
}
