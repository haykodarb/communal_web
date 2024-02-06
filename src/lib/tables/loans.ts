import { supabase, getCurrentUserId } from "../supabase";
import type { Book } from "./books";
import type { Community } from "./communities";
import type { Profile } from "./profiles";
import type { Tool } from "./tools";

export type Loan = {
    accepted: boolean;
    accepted_at: string | null;
    book: string | null;
    community: string;
    created_at: string;
    id: string;
    loanee: string;
    owner: string | null;
    rejected: boolean;
    rejected_at: string | null;
    returned: boolean;
    returned_at: string | null;
    review: string | null;
    tool: string | null;
    books: Book | null;
    tools: Tool | null;
    communities: Community;
    loanee_profile: Profile;
    owner_profile: Profile;
}

export async function getLoansWhere(requestType: string): Promise<{ result: Loan[] | null, error: string | null }> {
    try {
        const userId: string | undefined = await getCurrentUserId();

        if (userId == undefined)
            return { result: null, error: 'Could not get loans.' };


        const query = supabase.from('loans').select(
            '*, communities(*), books!left(*, profiles(*)), tools!left(*, profiles(*)), loanee_profile:profiles!loanee(*), owner_profile:profiles!owner(*)',
        );

        switch (requestType) {
            case 'owned':
                query.eq('returned', false).eq('rejected', false).eq('owner', userId).order('accepted_at', {ascending: false});;
                break;
            case 'borrowed':
                query.match(
                    {
                        'loanee': userId,
                        'returned': false,
                    },
                ).order('accepted_at', {ascending: false});
                break;
            case 'completed':
                query.eq('returned', true).order('returned_at', { ascending: false, });
            default:
                break;
        }

        const { data, error } = await query.returns<Loan[]>();

        if (error) throw error;

        if (data) {
            return { result: data, error: null };
        } else {
            return { result: null, error: 'Could not get tools.' };
        }
    } catch (error) {
        return { result: null, error: 'Could not get tools.' };
    }
}
