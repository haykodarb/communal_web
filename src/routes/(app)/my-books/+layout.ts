import { goto } from "$app/navigation";
import { getProfileFromUserId, type Profile } from "$lib/tables/profiles";
import { supabase } from "$lib/supabase";
import { getBooksForCurrentUser, type Book } from "$lib/tables/books";

export const prerender = true;

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