import type { QueryData } from "@supabase/supabase-js/dist/module/lib/types";
import { supabase, getCurrentUserId } from "../supabase";
import type { Tables } from "../types/database.types";
import type { Profile } from "./profiles";

export type Message = {
    content: string;
    created_at: string | null;
    deleted_receiver: boolean;
    deleted_sender: boolean;
    id: string;
    is_read: boolean;
    receiver: string | null;
    sender: string | null;
    sender_profile: Profile;
    receiver_profile: Profile;
}

export async function getDistinctChats(): Promise<{ result: Message[] | null, error: string | null }> {

    try {
        const userId: string | undefined = await getCurrentUserId();

        if (userId == undefined)
            return { result: null, error: 'Could not get chats.' };

        const { data, error } = await supabase.from('distinct_chats').select('*, receiver_profile:profiles!receiver(*),sender_profile:profiles!sender(*)').order('created_at', { ascending: false, }).returns<Message[]>();

        if (error) throw error;

        let returnList: Message[] = [];


        if (data) {
            data.forEach((first) => {
                let existingChat: Message | undefined = data.find((second) => {
                    return second.sender == first.receiver && first.sender == second.receiver;
                });

                if (existingChat == undefined) {
                    returnList.push(first);
                    return;
                }

                let firstChatNewer: boolean = Date.parse(first.created_at!) > Date.parse(existingChat.created_at!);

                if (firstChatNewer) {
                    returnList.push(first);
                    return;
                }
            }
            );

            return { result: returnList, error: null };
        } else {
            return { result: null, error: 'Could not get books.' };
        }
    } catch (error) {
        return { result: null, error: `${error}` };

    }

}
