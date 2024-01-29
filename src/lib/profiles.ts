// import { SupabaseClient, type QueryData } from "@supabase/supabase-js";
// import { BackendResponse, supabase } from "./supabase";

// export class Profile {
//     id: string;
//     username: string;
//     show_email: boolean;
//     email: string | null = null;
//     bio: string | null = null;
//     avatar_path: string | null = null;

//     constructor(username: string, id: string, show_email: boolean) {
//         this.username = username;
//         this.id = id;
//         this.show_email = show_email;
//     }

//     static async getProfileFromUserId(_id: string): Promise<BackendResponse<Profile | string>> {
//         const query = supabase.from('profiles').select().eq('id', _id).single();

//         type Profile = QueryData<typeof query>;

//         const {data, error} = await query;

//         if(error) throw error;

//         return new BackendResponse(true, '');
//     }
// }