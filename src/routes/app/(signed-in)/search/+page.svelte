<script lang="ts">
	import { page } from '$app/state';
	import FillCenter from '#lib/components/FillCenter.svelte';
	import { untrack } from 'svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import Loading from '#lib/components/Loading.svelte';
	import StickySearch from '#lib/components/StickySearch.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import TabBar from '#lib/components/TabBar.svelte';
	import UserRow from '#lib/components/UserRow.svelte';
	import VerticalBookCard from '#lib/components/VerticalBookCard.svelte';
	import { store } from '#lib/cache.ts';
	import { searchNetworkBooks, searchUsers } from '#lib/data/api.ts';
	import { keys, PAGE_SIZE, SEARCH_TABS } from '#lib/data/pages.ts';
	import { selectTab, tabFrom } from '#lib/tabs.ts';
	import type { NetworkBook, Profile } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';
	import type { PageProps } from './$types';

	// SearchPage: Books (friends and friends of friends) and Users tabs sharing
	// one query. The tab is in the URL (?tab=users), and the load fetches its
	// first page (through the page cache).
	let { data }: PageProps = $props();

	let query = $state('');
	// The selected tab is local state so it switches right away; the URL (and its
	// load) follows. It re-syncs if the URL changes externally.
	let tab = $state<number>(SEARCH_TABS.indexOf(tabFrom(page.url, SEARCH_TABS)));
	$effect(() => {
		tab = SEARCH_TABS.indexOf(tabFrom(page.url, SEARCH_TABS));
	});
	function select(i: number) {
		tab = i;
		selectTab(SEARCH_TABS[i], SEARCH_TABS);
	}

	const books = createPaged<NetworkBook>(
		(page) => searchNetworkBooks(query, { page, pageSize: PAGE_SIZE.network }),
		PAGE_SIZE.network,
		{
			seed: untrack(() => data.books),
			onChange: (state) => {
				if (!query) store(keys.network(), state);
			}
		}
	);
	const users = createPaged<Profile>(
		(page) => searchUsers(data.userId, query, { page, pageSize: PAGE_SIZE.network }),
		PAGE_SIZE.network,
		{
			seed: untrack(() => data.users),
			onChange: (state) => {
				if (!query) store(keys.users(), state);
			}
		}
	);

	// A tab switch, or a background refresh of the cached list, lands here. With
	// a query typed, the tab's list is searched instead.
	$effect(() => {
		const { books: freshBooks, users: freshUsers } = data;
		untrack(() => {
			if (freshBooks) {
				if (query) books.reset();
				else books.seed(freshBooks);
			} else if (freshUsers) {
				if (query) users.reset();
				else users.seed(freshUsers);
			}
		});
	});

	const current = $derived(tab === 0 ? books : users);

	const note = (book: NetworkBook) =>
		book.via ? t('via {name}').replace('{name}', book.via.username) : undefined;
</script>

<div class="page">
	<div class="controls">
		<TabBar
			tabs={[t('Books'), t('Users')]}
			index={tab}
			onchange={select}
		/>
	</div>
	<StickySearch floating={false}>
		<div class="search">
			<SearchBar bind:value={query} onSearch={() => current.reset()} />
		</div>
	</StickySearch>

	{#if tab === 0}
		{#if books.items.length > 0}
			<div class="grid">
				{#each books.items as book (book.id)}
					<VerticalBookCard {book} note={note(book)} />
				{/each}
			</div>
		{:else if books.error}
			<FillCenter><p class="error">{books.error}</p></FillCenter>
		{:else if !books.loading && !books.hasMore}
			<p class="muted">{t('No books found among your friends and their friends.')}</p>
		{/if}
	{:else if users.items.length > 0}
		<div class="users">
			{#each users.items as user (user.id)}
				<UserRow profile={user} />
			{/each}
		</div>
	{:else if users.error}
		<FillCenter><p class="error">{users.error}</p></FillCenter>
	{:else if !users.loading && !users.hasMore}
		<p class="muted">{t('No users found, likely a network issue.')}</p>
	{/if}

	{#if current.loading || (current.items.length === 0 && current.hasMore)}
		<Loading fill={current.items.length === 0} />
	{/if}
	{#key tab}
		<Sentinel onvisible={current.loadMore} />
	{/key}
</div>

<style>
	.page {
		min-height: 100vh;
		padding-bottom: 40px;
	}
	.controls {
		display: flex;
		flex-direction: column;
		/* SearchPage: tab bar, search bar and results all inset 10px. */
		padding: 0 10px 10px;
	}
	.search {
		padding: 0 10px;
	}
	.grid {
		display: grid;
		/* CommonListView grid: 2 columns, 8px spacing. */
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
		padding: 10px 10px 20px;
	}
	.users {
		padding: 10px 10px 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.muted {
		padding: 20px;
		text-align: center;
		color: var(--on-surface-variant);
	}
	.error {
		color: var(--error);
	}
	/* Flutter adds a 20px spacer above the search bar on desktop. */
	@media (min-width: 800px) {
		.page {
			padding-top: 20px;
		}
	}
</style>
