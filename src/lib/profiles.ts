import { supabase, BackendResponse } from "./supabase";
import type { Tables } from "./types/database.types";

export type Profile = Tables<'profiles'>;

export async function getProfileFromUserId(_id: string): Promise<BackendResponse<Profile | string>> {
    const query = supabase.from('profiles').select().eq('id', _id).single();

    const { data, error } = await query;

    if (error) throw error;

    if(data) {
        return new BackendResponse(true, data);
    } else {
        return new BackendResponse(false, 'Could not get profile');
    }
}