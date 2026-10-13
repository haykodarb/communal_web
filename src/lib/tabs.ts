import { goto } from '$app/navigation';
import { page } from '$app/state';

// Tab bars keep the selected tab in the URL (?tab=), so it survives a refresh,
// can be linked to, and reaches the page's load function (which then preloads
// and caches that tab's data like any page). The first tab is the bare URL.

/**
 * The URL in the address bar. After a shallow navigation (selectTab) `page.url`
 * keeps the URL the page was loaded with, and so does the history entry: Back
 * to it reloads that URL while the address bar shows the shallow one, which
 * is in `page.shallow.url`.
 */
export function shownUrl(): typeof page.url {
	return page.shallow?.url ?? page.url;
}

/** The tab named in `url`, or the first one. */
export function tabFrom<T extends string>(
	url: { searchParams: { get(name: string): string | null } },
	tabs: readonly T[]
): T {
	const name = url.searchParams.get('tab');
	return tabs.find((tab) => tab === name) ?? tabs[0];
}

/** Switch tabs: replaces the URL, so Back still leaves the page. */
export function selectTab<T extends string>(tab: T, tabs: readonly T[]): Promise<void> {
	const url = new URL(shownUrl().href);
	if (tab === tabs[0]) url.searchParams.delete('tab');
	else url.searchParams.set('tab', tab);
	// Shallow: update the address bar right away without re-running the load.
	// The tab's own list fetches its first page (the page's load still seeds it
	// on a direct visit).
	return goto(url, { replace: true, reset: false, shallow: true });
}
