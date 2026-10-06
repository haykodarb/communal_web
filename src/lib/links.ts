import { auth } from './auth.svelte';
import type { Book, Profile } from './data/models';

// Own books/profile have their own pages, mirroring the Flutter routes.

export function bookHref(book: Book): string {
	return book.owner.id === auth.user?.id ? `/app/my-books/${book.id}` : `/app/book/${book.id}`;
}

export function profileHref(profile: Profile): string {
	return profile.id === auth.user?.id ? '/app/my-profile' : `/app/profile/${profile.id}`;
}
