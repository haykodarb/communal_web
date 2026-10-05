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
