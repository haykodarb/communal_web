<script lang="ts">
	import type { Snippet } from 'svelte';
	import Avatar from './Avatar.svelte';
	import ReviewCard from './ReviewCard.svelte';
	import Sentinel from './Sentinel.svelte';
	import TabBar from './TabBar.svelte';
	import VerticalBookCard from './VerticalBookCard.svelte';
	import { getBooksForUser, getReviewsForUser } from '#lib/data/api.ts';
	import type { Book, Loan, Profile } from '#lib/data/models.ts';
	import { createPaged } from '#lib/paged.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';

	// Header, bio and Books/Reviews tabs shared by the own and other profile
	// pages (ProfileCommonHelpers in the Flutter app).
	let {
		profile,
		emptyBooks,
		emptyReviews,
		actions
	}: {
		profile: Profile;
		emptyBooks: string;
		emptyReviews: string;
		/** Buttons under the username. */
		actions: Snippet;
	} = $props();

	let tab = $state(0);

	// Both tabs page in like ProfileCommonController (infinite scroll).
	const PAGE_SIZE = 30;
	const books = createPaged<Book>(
		(page) => getBooksForUser(profile.id, { page, pageSize: PAGE_SIZE }),
		PAGE_SIZE
	);
	const reviews = createPaged<Loan>(
		(page) => getReviewsForUser(profile.id, { page, pageSize: PAGE_SIZE }),
		PAGE_SIZE
	);

</script>

<div class="header">
	<Avatar {profile} size={105} />
	<div class="info">
		<span class="username">{profile.username}</span>
		{#if profile.email}
			<span class="email">{profile.email}</span>
		{/if}
		<div class="actions">{@render actions()}</div>
	</div>
</div>

{#if profile.bio}
	<div class="bio">
		<span class="bio-title">{t('About me')}</span>
		<p class="bio-text">{profile.bio}</p>
	</div>
{/if}

<div class="tabs">
	<TabBar tabs={[t('Books'), t('Reviews')]} index={tab} onchange={(i) => (tab = i)} />
</div>

{#if tab === 0}
	{#if books.items.length === 0 && !books.loading && !books.hasMore}
		<p class="empty">{emptyBooks}</p>
	{:else}
		<div class="grid">
			{#each books.items as book (book.id)}
				<VerticalBookCard {book} />
			{/each}
		</div>
	{/if}
	<Sentinel onvisible={books.loadMore} />
{:else if reviews.items.length === 0 && !reviews.loading && !reviews.hasMore}
	<p class="empty">{emptyReviews}</p>
{:else}
	<div class="list">
		{#each reviews.items as loan (loan.id)}
			<ReviewCard {loan} />
		{/each}
	</div>
	<Sentinel onvisible={reviews.loadMore} />
{/if}

<style>
	.header {
		display: flex;
		gap: 20px;
		padding: 10px 20px;
	}
	.info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.username {
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
	}
	.email {
		font-size: 16px;
		color: var(--on-surface-variant);
	}
	.actions {
		margin-top: 10px;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.bio {
		padding: 10px 20px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.bio-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--secondary);
	}
	.bio-text {
		font-size: 14px;
		line-height: 1.4;
	}
	.tabs {
		padding: 5px 20px 10px;
	}
	.grid {
		display: grid;
		/* CommonListView grid: 2 columns, 8px spacing. */
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
		padding: 10px 20px;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px 20px;
	}
	.empty {
		padding: 30px 20px;
		text-align: center;
		white-space: pre-line;
		color: var(--on-surface-variant);
	}
</style>
