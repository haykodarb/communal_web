import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class BackendResponse<ResponseType> {
    success: boolean;
    payload: ResponseType;

    constructor(_success: boolean, _payload: ResponseType) {
        this.success = _success;
        this.payload = _payload
    }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        flowType: 'implicit',
    }
});