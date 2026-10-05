import { errorMessage } from './errors';

// Infinite-scroll list state (a slim CommonListViewController): call
// loadMore() when the end of the list comes into view, reset() on a new search.
export function createPaged<T>(load: (page: number) => Promise<T[]>, pageSize: number) {
	let items = $state<T[]>([]);
	let loading = $state(false);
	let hasMore = $state(true);
	let error = $state('');
	let page = 0;
	let generation = 0;

	async function loadMore(): Promise<void> {
		if (loading || !hasMore) return;
		loading = true;
		const current = generation;
		try {
			const next = await load(page);
			if (current !== generation) return; // a reset() happened meanwhile
			items = [...items, ...next];
			hasMore = next.length === pageSize;
			page += 1;
		} catch (e) {
			if (current !== generation) return;
			error = errorMessage(e);
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
		loadMore,
		reset(): Promise<void> {
			generation += 1;
			items = [];
			page = 0;
			hasMore = true;
			loading = false;
			error = '';
			return loadMore();
		}
	};
}
