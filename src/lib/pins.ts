// Pinned communities live on the device, like UserPreferences'
// pinned_communities box in the Flutter app.
const KEY = 'communal-pinned-communities';

export function getPinnedCommunities(): string[] {
	try {
		const value = JSON.parse(localStorage.getItem(KEY) ?? '[]');
		return Array.isArray(value) ? value : [];
	} catch {
		return [];
	}
}

export function setCommunityPinned(id: string, pinned: boolean): void {
	try {
		const ids = getPinnedCommunities().filter((x) => x !== id);
		if (pinned) ids.push(id);
		localStorage.setItem(KEY, JSON.stringify(ids));
	} catch {
		/* storage unavailable: pins just won't persist */
	}
}
