import { getCurrentUserId, supabase } from "$lib/supabase";
import type { Tables } from "$lib/types/database.types";

export type Community = Tables<'communities'>;


export async function getCommunitiesWhereUserIsMember(): Promise<{ result: Community[] | null, error: string | null }> {
    try {
        const userId: string | undefined = await getCurrentUserId();

        if (userId == undefined)
            return { result: null, error: 'Could not get communities.' };


        const {data, error} = await supabase.from('memberships').select("*, communities(*)").match({
            member: userId,
            accepted: true,
        }).order('joined_at', {
            ascending: false,
        });


        if (error) throw error;

        if (data) {
            const communities: Community[] = data.map((value) => value.communities as Community);

            return { result: communities, error: null };
        } else {
            return { result: null, error: 'Could not get books.' };
        }
    } catch (error) {
        return { result: null, error: 'Could not get books.' };
    }
}


export async function getCommunityAvatar(community: Community): Promise<{ result: Blob | null, error: string | null }> {
    try {
        const { data, error } = await supabase.storage.from('community_avatars').download(community.image_path!);

        if (error) {
            return { error: error.message, result: null };
        }

        if (data != null) {
            return { result: data, error: null };
        } else {
            return { result: null, error: 'Could not get community avatar.' };
        }
    } catch (error) {
        return { error: `${error}`, result: null };

    }
}