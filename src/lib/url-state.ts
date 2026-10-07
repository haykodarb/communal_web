import { goto } from '$app/navigation';
import { untrack } from 'svelte';

// List filters (search text and the filter sheet's choices) kept in the URL, so
// going back to a list, refreshing it or sharing its link keeps them. Values
// are readable names (?sort=title&status=pending); a filter at its default is
// left out, so the unfiltered list keeps a bare URL.

/**
 * The URL's query as a plain object, for a page's load to hand to the page.
 * (Read it there: when coming back with Back, the page's own `page.url` can
 * still be the previous page's while it starts.)
 */
export const queryOf = (url: URL): Record<string, string> => Object.fromEntries(url.searchParams);

/** The index of the option named by `param` in `query`, or 0 (the default). */
export function optionFrom(
	query: Record<string, string>,
	param: string,
	names: readonly string[]
): number {
	const index = names.indexOf(query[param] ?? '');
	return index < 0 ? 0 : index;
}

/** The text in `param`, or ''. */
export const textFrom = (query: Record<string, string>, param: string): string => query[param] ?? '';

/**
 * Writes the filters into the URL, replacing the current history entry (so
 * Back still leaves the page in one step). Each entry is a param and its
 * value; empty values and defaults (`null`) are removed. It's a real
 * (replacing) navigation, not a shallow one: on Back the router restores the
 * URL it knows, and a shallow update would leave it the unfiltered one.
 */
export function writeFilters(values: Record<string, string | null>): void {
	// Untracked: called from an effect, it must only react to the filter values,
	// never to the URL it writes (that would make it re-run itself).
	untrack(() => {
		// The address bar, not page.url: shallow updates (tab switches) only show
		// up there, and building from page.url would drop them.
		const url = new URL(location.href);
		for (const [param, value] of Object.entries(values)) {
			if (value) url.searchParams.set(param, value);
			else url.searchParams.delete(param);
		}
		if (url.search !== location.search) {
			goto(url, { replace: true, reset: false });
		}
	});
}

/** The option's name for the URL, or null for the default (first) option. */
export const optionParam = (names: readonly string[], index: number): string | null =>
	index > 0 ? names[index] : null;
