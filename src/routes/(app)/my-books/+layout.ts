import { goto } from "$app/navigation";
import { getBooksForCurrentUser, type Book } from "$lib/tables/books";

export const ssr = false;

export async function load(): Promise<{ books: Book[] } | undefined> {
    try {
        let { result, error } = await getBooksForCurrentUser();

        if (result != null) {
            return { books: result };
        }
    } catch (error) {
        goto('/auth');
    }
}