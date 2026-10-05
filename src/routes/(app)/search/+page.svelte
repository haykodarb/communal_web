<script lang="ts">
	import Avatar from '#lib/components/Avatar.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import TabBar from '#lib/components/TabBar.svelte';
	import VerticalBookCard from '#lib/components/VerticalBookCard.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { searchFriendsBooks, searchUsers } from '#lib/data/api.ts';
	import type { Book, Profile } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { profileHref } from '#lib/links.ts';
	import { createPaged } from '#lib/paged.svelte.ts';

	// SearchPage: Books (friends-of-friends) and Users tabs sharing one query.
	const PAGE_SIZE = 20;

	let query = $state('');
	let tab = $state(0);

	const books = createPaged<Book>(
		(page) => searchFriendsBooks(query, { page, pageSize: PAGE_SIZE }),
		PAGE_SIZE
	);
	const users = createPaged<Profile>(
		(page) => searchUsers(auth.user!.id, query, { page, pageSize: PAGE_SIZE }),
		PAGE_SIZE
	);

	const current = $derived(tab === 0 ? books : users);
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
		<SearchBar bind:value={query} onSearch={() => current.reset()} />
	</div>

	{#if tab === 0}
		{#if books.items.length > 0}
			<div class="grid">
				{#each books.items as book (book.id)}
					<VerticalBookCard {book} />
				{/each}
			</div>
		{:else if !books.loading && !books.hasMore}
			<p class="muted">
				{books.error || t('No books found in any of the communities you are a part of.')}
			</p>
		{/if}
	{:else if users.items.length > 0}
		<ul class="users">
			{#each users.items as user (user.id)}
				<li>
					<a class="user" href={profileHref(user)}>
						<Avatar profile={user} size={44} />
						<span>{user.username}</span>
					</a>
				</li>
			{/each}
		</ul>
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
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 10px;
		padding: 10px 20px;
	}
	.users {
		list-style: none;
		margin: 0;
		padding: 10px 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.user {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 10px;
		border-radius: 10px;
		background: var(--surface-container);
		color: inherit;
		font-weight: 600;
		text-decoration: none;
	}
	.muted {
		padding: 20px;
		text-align: center;
		color: var(--on-surface-variant);
	}
</style>
