import type { Session, User } from '@supabase/supabase-js';
import { clearCache } from './cache';
import { supabase } from './supabase';

let session = $state<Session | null>(null);
let ready = $state(false);

supabase.auth.onAuthStateChange((_event, next) => {
	session = next;
	ready = true;
});

/** Load the persisted session once on app start. */
export async function initAuth(): Promise<void> {
	const { data } = await supabase.auth.getSession();
	session = data.session;
	ready = true;
}

export const auth = {
	get session(): Session | null {
		return session;
	},
	get user(): User | null {
		return session?.user ?? null;
	},
	get ready(): boolean {
		return ready;
	},

	async signIn(email: string, password: string): Promise<void> {
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) throw error;
	},

	async signUp(email: string, password: string, username: string): Promise<boolean> {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { username } }
		});
		if (error) throw error;
		// When email confirmation is enabled there is no active session yet.
		return data.session !== null;
	},

	async signInWithGoogle(): Promise<void> {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo: `${window.location.origin}/auth/callback` }
		});
		if (error) throw error;
	},

	async resetPassword(email: string): Promise<void> {
		// Lands on the set-new-password page, like the Flutter app's /auth/reset.
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/auth/reset`
		});
		if (error) throw error;
	},

	async updatePassword(password: string): Promise<void> {
		const { error } = await supabase.auth.updateUser({ password });
		if (error) throw error;
	},

	/** Sends a confirmation link to the new address; the change applies once it's opened. */
	async updateEmail(email: string): Promise<void> {
		const { error } = await supabase.auth.updateUser(
			{ email },
			{ emailRedirectTo: `${window.location.origin}/my-profile/account` }
		);
		if (error) throw error;
	},

	async resendConfirmation(email: string): Promise<void> {
		const { error } = await supabase.auth.resend({
			type: 'signup',
			email,
			options: { emailRedirectTo: `${window.location.origin}/auth` }
		});
		if (error) throw error;
	},

	async signOut(): Promise<void> {
		await supabase.auth.signOut();
		clearCache();
	}
};
