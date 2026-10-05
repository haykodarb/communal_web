import { getProfile } from './data/api';
import type { Profile } from './data/models';

// The signed-in user's profile, shared by the drawer and profile pages
// (mirrors CommonDrawerController.currentUserProfile).
let profile = $state<Profile | null>(null);

export const currentProfile = {
	get value(): Profile | null {
		return profile;
	},
	set(next: Profile): void {
		profile = next;
	},
	async load(userId: string): Promise<Profile | null> {
		profile = await getProfile(userId);
		return profile;
	}
};
