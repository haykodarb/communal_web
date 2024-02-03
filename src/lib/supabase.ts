import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        flowType: 'implicit',
    }
});

export const getCurrentUserId = async (): Promise<string | undefined>  => {
   return (await supabase.auth.getUser()).data.user?.id;
}