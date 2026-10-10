<script lang="ts">
	import FillCenter from '#lib/components/FillCenter.svelte';
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import Loading from '#lib/components/Loading.svelte';
	import Skeleton from '#lib/components/Skeleton.svelte';
	import MasonryGrid from '#lib/components/MasonryGrid.svelte';
	import VerticalBookCard from '#lib/components/VerticalBookCard.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import ErrorState from '#lib/components/ErrorState.svelte';
	import Fab from '#lib/components/Fab.svelte';
	import FilterRow from '#lib/components/FilterRow.svelte';
	import FilterSheet from '#lib/components/FilterSheet.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import StickySearch from '#lib/components/StickySearch.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import { peek, store } from '#lib/cache.ts';
	import { getBooksForUser, type BooksQuery } from '#lib/data/api.ts';
	import { keys, PAGE_SIZE } from '#lib/data/pages.ts';
	import type { Book } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';
	import { optionFrom, optionParam, textFrom, writeFilters } from '#lib/url-state.ts';
	import type { PageProps } from './$types';

	// BookListPage: the user's books, searchable, with BookListController's
	// order/filter sheet and infinite scroll. The first page comes from the load
	// (and the page cache, which also keeps every page scrolled through).
	let { data }: PageProps = $props();
	const ORDERS: NonNullable<BooksQuery['orderBy']>[] = ['created_at', 'title', 'author'];
	const FILTERS: (boolean | undefined)[] = [undefined, false, true]; // all / available / loaned

	// The search and the sheet's choices live in the URL (?q=, ?sort=, ?show=),
	// so coming back to the list keeps them.
	const SORT = ['date', 'title', 'author'];
	const SHOW = ['all', 'available', 'loaned'];

	let search = $state(textFrom(untrack(() => data.query), 'q'));
	let orderIndex = $state(optionFrom(untrack(() => data.query), 'sort', SORT));
	let filterIndex = $state(optionFrom(untrack(() => data.query), 'show', SHOW));
	let sheet: FilterSheet;

	const unfiltered = () => !search && orderIndex === 0 && filterIndex === 0;

	// Each filter combination is cached under its own key (sharing the list's
	// prefix, so mutations drop them too), so coming back to a filtered list
	// shows it at once, every page included, instead of a skeleton.
	const cacheKey = () =>
		unfiltered() ? keys.myBooks(data.userId) : `${keys.myBooks(data.userId)}:${JSON.stringify([search.trim(), orderIndex, filterIndex])}`;

	const books = createPaged<Book>(
		(page) =>
			getBooksForUser(data.userId, {
				search,
				orderBy: ORDERS[orderIndex],
				loaned: FILTERS[filterIndex],
				page,
				pageSize: PAGE_SIZE.books
			}),
		PAGE_SIZE.books,
		{
			seed: untrack(() => (unfiltered() ? data.books : peek(cacheKey()))),
			onChange: (state) => {
				store(cacheKey(), state);
			}
		}
	);

	// Opened with filters from the URL and nothing cached for them: load.
	if (!untrack(unfiltered) && !untrack(() => peek(cacheKey()))) books.reset();

	$effect(() => {
		writeFilters({
			q: search.trim() || null,
			sort: optionParam(SORT, orderIndex),
			show: optionParam(SHOW, filterIndex)
		});
	});

	// A background refresh of the cached list lands here.
	$effect(() => {
		const fresh = data.books;
		untrack(() => {
			if (unfiltered()) books.seed(fresh);
		});
	});
</script>

<div class="page">
	<StickySearch>
		<div class="search">
			<SearchBar bind:value={search} onSearch={() => books.reset()} onFilter={() => sheet.open()} />
		</div>
	</StickySearch>

	{#if books.items.length > 0}
		<div class="grid">
			<MasonryGrid items={books.items} key={(b) => b.id} columns={3}>
				{#snippet item(book)}<VerticalBookCard {book} />{/snippet}
			</MasonryGrid>
		</div>
	{:else if books.error}
		<FillCenter><ErrorState message={books.error} onretry={() => books.reset()} /></FillCenter>
	{:else if !books.loading && !books.hasMore}
		<EmptyState
			icon="library"
			title={t('No books found in your library.')}
			actionLabel={t('Add book')}
			actionIcon="plus"
			href="/my-books/create"
		/>
	{/if}
	{#if books.loading}
		{#if books.items.length === 0}
			<div class="grid"><Skeleton kind="grid" count={6} /></div>
		{:else}
			<Loading fill={false} />
		{/if}
	{/if}
	<Sentinel onvisible={books.loadMore} />

	<Fab icon="plus" label={t('Add book')} onclick={() => goto('/my-books/create')} />
</div>

<FilterSheet bind:this={sheet}>
	<FilterRow
		title={t('Order by')}
		options={[t('Date'), t('Title'), t('Author')]}
		index={orderIndex}
		onchange={(i) => {
			orderIndex = i;
			books.reset();
		}}
	/>
	<FilterRow
		title={t('Filter by')}
		options={[t('All'), t('Available'), t('Loaned')]}
		index={filterIndex}
		onchange={(i) => {
			filterIndex = i;
			books.reset();
		}}
	/>
</FilterSheet>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.search {
		/* 5px here + SearchBar's own 5px = the 10px the grid uses. */
		padding: 0 5px;
	}
	/* CommonListView grid: a masonry (see MasonryGrid), as on Search and profiles. */
	.grid {
		padding: 10px 10px 20px;
	}
	/* Flutter adds a 20px spacer above the search bar on desktop. */
	@media (min-width: 800px) {
		.page {
			padding-top: 20px;
		}
	}
</style>
