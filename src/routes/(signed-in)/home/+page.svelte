<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import Loading from '#lib/components/Loading.svelte';
	import Skeleton from '#lib/components/Skeleton.svelte';
	import LoanCard from '#lib/components/LoanCard.svelte';
	import MasonryGrid from '#lib/components/MasonryGrid.svelte';
	import PillButton from '#lib/components/PillButton.svelte';
	import ReviewCard from '#lib/components/ReviewCard.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import VerticalBookCard from '#lib/components/VerticalBookCard.svelte';
	import { store } from '#lib/cache.ts';
	import { searchNetworkBooks } from '#lib/data/api.ts';
	import { keys, PAGE_SIZE } from '#lib/data/pages.ts';
	import type { Loan, NetworkBook } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';
	import type { PageProps } from './$types';

	// What's going on around you: the books that are out right now, what your
	// network added lately and what your friends have been reviewing. Things to
	// act on (requests, available books) are in Notifications. Each section
	// hides itself when empty; the network list, last, loads more as you scroll.
	let { data }: PageProps = $props();

	/** How many loans and reviews to show before "See all". */
	const LOANS_PREVIEW = 2;
	const REVIEWS_PREVIEW = 2;

	const activeLoans = $derived<Loan[]>(data.activeLoans);
	const reviews = $derived<Loan[]>(data.reviews.items.slice(0, REVIEWS_PREVIEW));

	// The same list (and cache entry) as Search's Books tab, so pages loaded here
	// are already there, and the other way round.
	const network = createPaged<NetworkBook>(
		(page) => searchNetworkBooks('', { page, pageSize: PAGE_SIZE.network }),
		PAGE_SIZE.network,
		{
			seed: untrack(() => data.network),
			onChange: (state) => store(keys.network(), state)
		}
	);

	// A background refresh of the cached list lands here.
	$effect(() => {
		const fresh = data.network;
		untrack(() => network.seed(fresh));
	});
</script>

<div class="page">
	{#if activeLoans.length > 0}
		<section>
			<div class="heading">
				<h2>{t('On loan')}</h2>
				<a class="see-all" href="/loans">{t('See all')}</a>
			</div>
			<div class="loans">
				{#each activeLoans.slice(0, LOANS_PREVIEW) as loan (loan.id)}
					<LoanCard {loan} />
				{/each}
			</div>
		</section>
	{/if}
	{#if reviews.length > 0}
		<section>
			<div class="heading">
				<h2>{t('Recent reviews from friends')}</h2>
				<a class="see-all" href="/reviews">{t('See all')}</a>
			</div>
			<div class="reviews">
				{#each reviews as loan (loan.id)}
					<ReviewCard {loan} showReviewer />
				{/each}
			</div>
		</section>
	{/if}

	<section>
		<h2>{t('New in your network')}</h2>
		{#if network.items.length > 0}
			<MasonryGrid items={network.items} key={(b) => b.id} columns={3}>
				{#snippet item(book)}<VerticalBookCard {book} />{/snippet}
			</MasonryGrid>
		{:else if network.error}
			<p class="error-text">{network.error}</p>
		{:else if !network.loading && !network.hasMore}
			<div class="empty">
				<p>{t('No books from your friends yet. Find people you know in Search.')}</p>
				<PillButton icon="search" label={t('Search')} onclick={() => goto('/search?tab=users')} />
			</div>
		{/if}
		{#if network.loading}
			{#if network.items.length === 0}
				<Skeleton kind="grid" count={6} />
			{:else}
				<Loading fill={false} />
			{/if}
		{/if}
		<Sentinel onvisible={network.loadMore} />
	</section>

</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding: 10px 10px 40px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	h2 {
		padding: 0 5px;
		font-size: 16px;
		font-weight: 600;
	}
	.heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}
	.see-all {
		padding: 0 5px;
		font-size: 13px;
		color: var(--primary);
		text-decoration: none;
	}
	@media (hover: hover) {
		.see-all:hover {
			text-decoration: underline;
			text-underline-offset: 3px;
		}
	}
	a {
		color: inherit;
	}

	/* On loan: the Loans page's cards (same 5px inset). */
	.loans {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 0 5px;
	}

	.error-text {
		padding: 0 5px;
		font-size: 13px;
		color: var(--error);
	}
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 30px 20px;
		border-radius: 10px;
		background: var(--surface-container);
		text-align: center;
		color: var(--on-surface-variant);
	}

	/* Recent reviews: the profile Reviews tab's cards, with the reviewer. */
	.reviews {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 0 5px;
	}
	/* Flutter adds a 20px spacer at the top on desktop. */
	@media (min-width: 800px) {
		.page {
			padding-top: 20px;
		}
	}
</style>
