// TypeScript mirrors of the Flutter models in communal_app/lib/models.

export interface Profile {
	id: string;
	username: string;
	show_email: boolean;
	email?: string | null;
	bio?: string | null;
	avatar_path?: string | null;
	fcm_token?: string | null;
}

export interface Book {
	id: string;
	created_at: string;
	title: string;
	author: string;
	image_path: string;
	review?: string | null;
	owner: Profile;
	loaned: boolean;
	public: boolean;
}

export interface Community {
	id: string;
	name: string;
	description?: string | null;
	image_path?: string | null;
	owner: Profile;
	user_count: number;
	isCurrentUserAdmin?: boolean;
}

export interface Loan {
	id: string;
	created_at: string;
	accepted_at?: string | null;
	returned_at?: string | null;
	rejected_at?: string | null;
	latest_date?: string | null;
	review?: string | null;
	community?: Community | null;
	book: Book;
	owner: Profile;
	loanee: Profile;
	accepted: boolean;
	rejected: boolean;
	returned: boolean;
}

export type LoanStatus = 'pending' | 'accepted' | 'rejected' | 'returned';

export function loanStatus(loan: Loan): LoanStatus {
	if (loan.returned) return 'returned';
	if (loan.rejected) return 'rejected';
	if (loan.accepted) return 'accepted';
	return 'pending';
}

export interface Friendship {
	id: number;
	created_at: string;
	accepted_at?: string | null;
	requester: Profile;
	responder: Profile;
	/** null while pending, false when rejected. */
	accepted: boolean | null;
}

export interface Membership {
	id: string;
	created_at: string;
	joined_at?: string | null;
	member: Profile;
	community: Community;
	member_accepted: boolean | null;
	admin_accepted: boolean | null;
	is_admin: boolean;
}

export interface AppNotification {
	id: number;
	/** Source table and event, e.g. loans/accepted or friendships/created. */
	type: { id: number; table: string; event: string };
	updated_at: string;
	seen: boolean;
	sender: Profile | null;
	receiver: Profile;
	loan: Loan | null;
	friendship: Friendship | null;
	membership: Membership | null;
}

export interface Message {
	id: string;
	created_at: string;
	sender: Profile;
	receiver: Profile;
	content: string;
	is_read: boolean;
	/** Only on rows from the distinct_chats view. */
	unread_messages?: number | null;
}

/** A community member's profile plus their admin flag. */
export interface Member extends Profile {
	is_admin: boolean;
}

export interface DiscussionMessage {
	id: string;
	created_at: string;
	sender: Profile;
	content: string;
	topicId: string;
}

export interface DiscussionTopic {
	id: string;
	created_at: string;
	creator: Profile;
	community: Community;
	name: string;
	last_message: DiscussionMessage | null;
}
