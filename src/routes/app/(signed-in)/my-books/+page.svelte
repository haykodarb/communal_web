<script lang="ts">
	import FillCenter from '#lib/components/FillCenter.svelte';
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import Loading from '#lib/components/Loading.svelte';
	import BookCard from '#lib/components/BookCard.svelte';
	import Fab from '#lib/components/Fab.svelte';
	import FilterRow from '#lib/components/FilterRow.svelte';
	import FilterSheet from '#lib/components/FilterSheet.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import StickySearch from '#lib/components/StickySearch.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import { store } from '#lib/cache.ts';
	import { getBooksForUser, type BooksQuery } from '#lib/data/api.ts';
	import { keys, PAGE_SIZE } from '#lib/data/pages.ts';
	import type { Book } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';
	import type { PageProps } from './$types';

	// BookListPage: the user's books, searchable, with BookListController's
	// order/filter sheet and infinite scroll. The first page comes from the load
	// (and the page cache, which also keeps every page scrolled through).
	let { data }: PageProps = $props();
	const ORDERS: NonNullable<BooksQuery['orderBy']>[] = ['created_at', 'title', 'author'];
	const FILTERS: (boolean | undefined)[] = [undefined, false, true]; // all / available / loaned

	let search = $state('');
	let orderIndex = $state(0);
	let filterIndex = $state(0);
	let sheet: FilterSheet;

	/** The cache holds the unfiltered list only. */
	const unfiltered = () => !search && orderIndex === 0 && filterIndex === 0;

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
			seed: untrack(() => data.books),
			onChange: (state) => {
				if (unfiltered()) store(keys.myBooks(data.userId), state);
			}
		}
	);

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
		<SearchBar bind:value={search} onSearch={() => books.reset()} onFilter={() => sheet.open()} />
	</StickySearch>

	{#if books.items.length > 0}
		<div class="list">
			{#each books.items as book (book.id)}
				<BookCard {book} />
			{/each}
		</div>
	{:else if books.error}
		<FillCenter><p class="error">{books.error}</p></FillCenter>
	{:else if !books.loading && !books.hasMore}
		<div class="empty">
			<p>{t('No books found in your library.')}</p>
			<p>{t('You can upload some with the floating button on the bottom right.')}</p>
		</div>
	{/if}
	{#if books.loading}
		<Loading fill={books.items.length === 0} />
	{/if}
	<Sentinel onvisible={books.loadMore} />

	<Fab icon="plus" label={t('Add book')} onclick={() => goto('/app/my-books/create')} />
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
	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px 5px 0;
	}
	.error {
		padding: 0 10px;
		color: var(--error);
	}
	.empty {
		margin-top: 40px;
		padding: 0 20px;
		text-align: center;
		color: var(--on-surface-variant);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	/* Flutter adds a 20px spacer above the search bar on desktop. */
	@media (min-width: 800px) {
		.page {
			padding-top: 20px;
		}
	}
</style>
