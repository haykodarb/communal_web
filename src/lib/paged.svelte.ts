import { errorMessage } from './errors';

/** Everything loaded so far, as kept in the page cache. */
export interface PagedState<T> {
	items: T[];
	/** Pages loaded so far. */
	pages: number;
	hasMore: boolean;
}

// Infinite-scroll list state (a slim CommonListViewController): call
// loadMore() when the end of the list comes into view, reset() on a new search.
// `seed` starts it from data a load function fetched (or the cache kept), and
// `onChange` is told about every page loaded so the cache can keep them too.
export function createPaged<T>(
	load: (page: number) => Promise<T[]>,
	pageSize: number,
	{
		seed,
		onChange
	}: { seed?: PagedState<T>; onChange?: (state: PagedState<T>) => void } = {}
) {
	let items = $state<T[]>(seed?.items ?? []);
	let loading = $state(false);
	let hasMore = $state(seed?.hasMore ?? true);
	let error = $state('');
	// reset(true): the current items stay (dimmed by the page) until the new first
	// page replaces them.
	let replacing = $state(false);
	let page = seed?.pages ?? 0;
	let generation = 0;

	async function loadMore(): Promise<void> {
		if (loading || !hasMore) return;
		loading = true;
		const current = generation;
		try {
			const next = await load(page);
			if (current !== generation) return; // a reset() happened meanwhile
			items = replacing ? next : [...items, ...next];
			replacing = false;
			hasMore = next.length === pageSize;
			page += 1;
			onChange?.({ items, pages: page, hasMore });
		} catch (e) {
			if (current !== generation) return;
			error = errorMessage(e);
			if (replacing) items = [];
			replacing = false;
			hasMore = false;
		} finally {
			if (current === generation) loading = false;
		}
	}

	return {
		get items() {
			return items;
		},
		set items(value: T[]) {
			items = value;
			onChange?.({ items, pages: page, hasMore });
		},
		get loading() {
			return loading;
		},
		get hasMore() {
			return hasMore;
		},
		get error() {
			return error;
		},
		/** A reset(true) waiting for its first page, while the old items still show. */
		get refreshing() {
			return replacing;
		},
		loadMore,
		/** Replace the contents with fresher data (a background refresh). */
		seed(state: PagedState<T>): void {
			generation += 1;
			replacing = false;
			items = state.items;
			page = state.pages;
			hasMore = state.hasMore;
			loading = false;
			error = '';
		},
		/**
		 * Start over from the first page (a new search). With `keep`, the current
		 * items stay until the new ones arrive, instead of the list emptying.
		 */
		reset(keep = false): Promise<void> {
			generation += 1;
			replacing = keep && items.length > 0;
			if (!replacing) items = [];
			page = 0;
			hasMore = true;
			loading = false;
			error = '';
			return loadMore();
		}
	};
}

/**
 * Loads the first page of a list for a load function, or refreshes all pages
 * the cache holds in one request (so a background refresh doesn't shrink a
 * list the user has scrolled through).
 */
export async function firstPages<T>(
	load: (page: number, pageSize: number) => Promise<T[]>,
	pageSize: number,
	previous?: PagedState<T>
): Promise<PagedState<T>> {
	const pages = Math.max(1, previous?.pages ?? 1);
	const items = await load(0, pages * pageSize);
	return { items, pages, hasMore: items.length === pages * pageSize };
}
