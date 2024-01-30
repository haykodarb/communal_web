import { getProfileFromUserId, type Profile } from "$lib/profiles";
import { BackendResponse, supabase } from "$lib/supabase";

export const prerender = true;
export const ssr = false;

export async function load(): Promise<Profile | undefined> {
  let currentUser: Profile;
  try {
    let { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log(error);
    }

    if (data.session != null) {

      let result: BackendResponse<Profile | string> = await getProfileFromUserId(
        data.session.user.id
      );

      if (result.success) {
        currentUser = result.payload as Profile;
        console.log(currentUser);
        return currentUser;
      }
    }
  } catch (error) {
    console.log(error);
  }
}