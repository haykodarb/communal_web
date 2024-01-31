import { goto } from "$app/navigation";
import { getProfileFromUserId, type Profile } from "$lib/tables/profiles";
import { supabase } from "$lib/supabase";

export const prerender = true;
export const ssr = false;

export async function load(): Promise<Profile | undefined> {
  try {
    let { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log(error);
    }

    if (data.session != null) {

      let {result, error} = await getProfileFromUserId(
        data.session.user.id
      );

      if (result != null) {
        return result;
      }
    } else {
      goto('/auth');
    }
  } catch (error) {
    console.log(error);
  }
}