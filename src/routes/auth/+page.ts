import { goto } from "$app/navigation";
import { supabase } from "$lib/supabase";

export const ssr = false;

export async function load(): Promise<void> {
    try {
        let { data, error } = await supabase.auth.getSession();

        if (error) {
            console.log(error);
        }

        if (data.session != null) {
            goto('/communities');
        } 
    } catch (error) {
        console.log(error);
    }
}