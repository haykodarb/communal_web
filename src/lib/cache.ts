import { invalidate } from '$app/navigation';

// A small stale-while-revalidate cache for page data, used by load functions.
// Combined with link preloading this makes navigation instant: hovering a link
// fills the cache, going back to a page shows what it showed before (and the
// browser can restore the scroll position), and stale data is refreshed in the
// background, re-running the page's load when it lands.

interface Entry {
	value: unknown;
	at: number;
	refreshing?: Promise<unknown>;
}

/** Younger than this, cached data is used as is. */
const FRESH_MS = 15_000;
/** Older than this, cached data is not shown at all; the load waits instead. */
const MAX_AGE_MS = 30 * 60_000;

const entries = new Map<string, Entry>();

/** The dependency id a load registers for `key` (see SvelteKit's `depends`). */
const dependency = (key: string) => `cache:${key}`;

/**
 * Returns the cached value for `key`, fetching it if missing or too old. A
 * stale value is returned immediately and refreshed in the background.
 * Pass the load's `depends` so the page re-runs when the refresh lands.
 */
export async function cached<T>(
	key: string,
	fetch: () => Promise<T>,
	depends: (...deps: `${string}:${string}`[]) => void
): Promise<T> {
	depends(dependency(key) as `${string}:${string}`);
	const entry = entries.get(key);
	const age = entry ? Date.now() - entry.at : Infinity;

	if (entry && age < FRESH_MS) return entry.value as T;
	if (entry && age < MAX_AGE_MS) {
		entry.refreshing ??= fetch()
			.then((value) => {
				entries.set(key, { value, at: Date.now() });
				return invalidate(dependency(key));
			})
			.catch(() => {
				// Keep showing the old value; the next visit retries.
				entry.refreshing = undefined;
			});
		return entry.value as T;
	}

	const value = await fetch();
	entries.set(key, { value, at: Date.now() });
	return value;
}

/** Peek at a cached value without fetching. */
export function peek<T>(key: string): T | undefined {
	return entries.get(key)?.value as T | undefined;
}

/** Replace a cached value, e.g. when a list loads more pages. */
export function store<T>(key: string, value: T): void {
	entries.set(key, { value, at: entries.get(key)?.at ?? Date.now() });
}

/**
 * Forget everything under these key prefixes (after a mutation or a realtime
 * change), so the next visit loads fresh data.
 */
export function drop(...prefixes: string[]): void {
	for (const key of entries.keys()) {
		if (prefixes.some((prefix) => key.startsWith(prefix))) entries.delete(key);
	}
}

/** On sign-out: nothing may leak into the next session. */
export function clearCache(): void {
	entries.clear();
}
