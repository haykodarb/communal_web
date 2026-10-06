<script lang="ts">
	import { goto } from '$app/navigation';
	import Loading from '#lib/components/Loading.svelte';
	import BookCard from '#lib/components/BookCard.svelte';
	import Fab from '#lib/components/Fab.svelte';
	import FilterRow from '#lib/components/FilterRow.svelte';
	import FilterSheet from '#lib/components/FilterSheet.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import StickySearch from '#lib/components/StickySearch.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { getBooksForUser, type BooksQuery } from '#lib/data/api.ts';
	import type { Book } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';

	// BookListPage: the user's books, searchable, with BookListController's
	// order/filter sheet and infinite scroll.
	const PAGE_SIZE = 30;
	const ORDERS: NonNullable<BooksQuery['orderBy']>[] = ['created_at', 'title', 'author'];
	const FILTERS: (boolean | undefined)[] = [undefined, false, true]; // all / available / loaned

	let search = $state('');
	let orderIndex = $state(0);
	let filterIndex = $state(0);
	let sheet: FilterSheet;

	const books = createPaged<Book>(
		(page) =>
			getBooksForUser(auth.user!.id, {
				search,
				orderBy: ORDERS[orderIndex],
				loaned: FILTERS[filterIndex],
				page,
				pageSize: PAGE_SIZE
			}),
		PAGE_SIZE
	);
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
		<p class="error">{books.error}</p>
	{:else if !books.loading && !books.hasMore}
		<div class="empty">
			<p>{t('No books found in your library.')}</p>
			<p>{t('You can upload some with the floating button on the bottom right.')}</p>
		</div>
	{/if}
	{#if books.loading}
		<Loading />
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
	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 0 5px;
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
