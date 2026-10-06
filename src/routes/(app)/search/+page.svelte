<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import FilterSheet from '#lib/components/FilterSheet.svelte';
	import PillButton from '#lib/components/PillButton.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import TabBar from '#lib/components/TabBar.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import UserRow from '#lib/components/UserRow.svelte';
	import VerticalBookCard from '#lib/components/VerticalBookCard.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { searchNetworkBooks, searchUsers } from '#lib/data/api.ts';
	import type { NetworkBook, Profile } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';

	// SearchPage: Books (friends and friends of friends) and Users tabs sharing
	// one query; books can also be filtered by the owner's location.
	const PAGE_SIZE = 20;

	let query = $state('');
	let tab = $state(0);
	let location = $state('');
	let locationDraft = $state('');
	let sheet: FilterSheet;

	const books = createPaged<NetworkBook>(
		(page) => searchNetworkBooks(query, location, { page, pageSize: PAGE_SIZE }),
		PAGE_SIZE
	);
	const users = createPaged<Profile>(
		(page) => searchUsers(auth.user!.id, query, { page, pageSize: PAGE_SIZE }),
		PAGE_SIZE
	);

	const current = $derived(tab === 0 ? books : users);

	function note(book: NetworkBook): string {
		const parts = [];
		if (book.via) parts.push(t('via {name}').replace('{name}', book.via.username));
		if (book.owner.location) parts.push(book.owner.location);
		return parts.join(' · ');
	}

	function applyLocation(value: string) {
		location = value.trim();
		locationDraft = location;
		sheet.close();
		books.reset();
	}
</script>

<div class="page">
	<div class="controls">
		<TabBar
			tabs={[t('Books'), t('Users')]}
			index={tab}
			onchange={(i) => {
				tab = i;
				(i === 0 ? books : users).reset();
			}}
		/>
		<SearchBar
			bind:value={query}
			onSearch={() => current.reset()}
			onFilter={tab === 0
				? () => {
						locationDraft = location;
						sheet.open();
					}
				: undefined}
		/>
		{#if tab === 0 && location}
			<div class="active-filter">
				<PillButton icon="location" label={`${location}  ✕`} onclick={() => applyLocation('')} />
			</div>
		{/if}
	</div>

	{#if tab === 0}
		{#if books.items.length > 0}
			<div class="grid">
				{#each books.items as book (book.id)}
					<VerticalBookCard {book} note={note(book)} />
				{/each}
			</div>
		{:else if !books.loading && !books.hasMore}
			<p class="muted">
				{books.error || t('No books found among your friends and their friends.')}
			</p>
		{/if}
	{:else if users.items.length > 0}
		<div class="users">
			{#each users.items as user (user.id)}
				<UserRow profile={user} subtitle={user.location} />
			{/each}
		</div>
	{:else if !users.loading && !users.hasMore}
		<p class="muted">{users.error || t('No users found, likely a network issue.')}</p>
	{/if}

	{#if current.loading}
		<p class="muted">{t('Loading…')}</p>
	{/if}
	{#key tab}
		<Sentinel onvisible={current.loadMore} />
	{/key}
</div>

<FilterSheet bind:this={sheet}>
	<TextField
		label={t('Location (neighbourhood or city)')}
		bind:value={locationDraft}
		maxlength={60}
		onsubmit={() => applyLocation(locationDraft)}
	/>
	<Button onclick={() => applyLocation(locationDraft)}>{t('Apply')}</Button>
</FilterSheet>

<style>
	.page {
		min-height: 100vh;
		padding-bottom: 40px;
	}
	.controls {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px 20px;
	}
	.active-filter {
		display: flex;
	}
	.grid {
		display: grid;
		/* CommonListView grid: 2 columns, 8px spacing. */
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
		padding: 10px 20px;
	}
	.users {
		padding: 10px 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.muted {
		padding: 20px;
		text-align: center;
		color: var(--on-surface-variant);
	}
	/* Flutter adds a 20px spacer above the search bar on desktop. */
	@media (min-width: 800px) {
		.page {
			padding-top: 20px;
		}
	}
</style>
