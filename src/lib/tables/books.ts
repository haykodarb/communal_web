import { supabase, getCurrentUserId } from "../supabase";
import type { Tables } from "../types/database.types";

export type Book = Tables<'books'>;

export type BookForm = {
    title: string;
    author: string;
    review: string | null;
    read:boolean;
    available:boolean;
}

export async function getBooksForCurrentUser(): Promise<{ result: Book[] | null, error: string | null }> {
    try {
        const userId: string | undefined = await getCurrentUserId();

        if (userId == undefined)
            return { result: null, error: 'Could not get books.' };


        const query = supabase.from('books').select().eq('owner', userId);

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
            return { result: data, error: null };
        } else {
            return { result: null, error: 'Could not get books.' };
        }
    } catch (error) {
        return { result: null, error: 'Could not get books.' };
    }
}


export async function getBookInformation(bookId: string): Promise<{ result: Book | null, error: string | null }> {
    try {

        const query = supabase.from('books').select().eq('id', bookId).single();

        const { data, error } = await query;
        if (data) {
            return { result: data, error: null };
        } else {
            return { result: null, error: 'Could not get books.' };
        }

    } catch (error) {
        return { error: `${error}`, result: null };

    }
}



export async function getBookCover(book: Book): Promise<{ result: Blob | null, error: string | null }> {
    try {
        const { data, error } = await supabase.storage.from('book_covers').download(book.image_path);

        if (error) {
            return { error: error.message, result: null };
        }

        if (data != null) {
            return { result: data, error: null };
        } else {
            return { result: null, error: 'Could not get book cover' };
        }
    } catch (error) {
        return { error: `${error}`, result: null };

    }
}