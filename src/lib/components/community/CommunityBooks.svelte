<script lang="ts">
	import SearchBar from '../SearchBar.svelte';
	import Loading from '../Loading.svelte';
	import StickySearch from '../StickySearch.svelte';
	import Sentinel from '../Sentinel.svelte';
	import VerticalBookCard from '../VerticalBookCard.svelte';
	import { getBooksInCommunity } from '#lib/data/api.ts';
	import type { Book } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';

	// CommunityBooksPage: books shared in the community, searchable.
	let { communityId }: { communityId: string } = $props();

	const PAGE_SIZE = 30;
	let search = $state('');
	const books = createPaged<Book>(
		(page) => getBooksInCommunity(communityId, { search, page, pageSize: PAGE_SIZE }),
		PAGE_SIZE
	);
</script>

<StickySearch>
	<div class="search"><SearchBar bind:value={search} onSearch={() => books.reset()} /></div>
</StickySearch>

{#if books.items.length > 0}
	<div class="grid">
		{#each books.items as book (book.id)}
			<VerticalBookCard {book} />
		{/each}
	</div>
{:else if !books.loading && !books.hasMore}
	<p class="empty">{books.error || t('community-books-no-items')}</p>
{/if}
{#if books.loading}
	<Loading />
{/if}
<Sentinel onvisible={books.loadMore} />

<style>
	.search {
		padding: 0 10px;
	}
	.grid {
		display: grid;
		/* CommonListView grid: 2 columns, 8px spacing. */
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
		padding: 0 20px 10px;
	}
	.empty {
		padding: 30px 20px;
		text-align: center;
		white-space: pre-line;
		color: var(--on-surface-variant);
	}
</style>
