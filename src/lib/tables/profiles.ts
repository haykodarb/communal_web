import { supabase } from "../supabase";
import type { Tables } from "../types/database.types";

export type Profile = Tables<'profiles'>;

export async function getProfileFromUserId(_id: string): Promise<{ result: Profile | null, error: string | null }> {
    try {
        
        const query = supabase.from('profiles').select().eq('id', _id).single();
    
        const { data, error } = await query;
    
        if (error) throw error;
    
        if (data) {
            return { result: data, error: null };
        } else {
            return { result: null, error: 'Could not get profile.' };
        }
    } catch (error) {
        return { result: null, error: `${error}` };        
    }
}