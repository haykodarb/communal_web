import { supabase, getCurrentUserId } from "../supabase";
import type { Tables } from "../types/database.types";

export type Tool = Tables<'tools'>;

export async function getToolsForCurrentUser(): Promise<{ result: Tool[] | null, error: string | null }> {
    try {
        const userId: string | undefined = await getCurrentUserId();

        if (userId == undefined)
            return { result: null, error: 'Could not get tools.' };


        const query = supabase.from('tools').select().eq('owner', userId);

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
            return { result: data, error: null };
        } else {
            return { result: null, error: 'Could not get tools.' };
        }
    } catch (error) {
        return { result: null, error: 'Could not get tools.' };
    }
}

export async function getToolImage(tool: Tool): Promise<{ result: Blob | null, error: string | null }> {
    try {
        const { data, error } = await supabase.storage.from('tool_images').download(tool.image_path);

        if (error) {
            return { error: error.message, result: null };
        }

        if (data != null) {
            return { result: data, error: null };
        } else {
            return { result: null, error: 'Could not get tool image' };
        }
    } catch (error) {
        return { error: `${error}`, result: null };

    }
}