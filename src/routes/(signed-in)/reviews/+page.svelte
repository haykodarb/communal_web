<script lang="ts">
	import { appear } from '#lib/motion.ts';
	import { untrack } from 'svelte';
	import FillCenter from '#lib/components/FillCenter.svelte';
	import Loading from '#lib/components/Loading.svelte';
	import Skeleton from '#lib/components/Skeleton.svelte';
	import PageBar from '#lib/components/PageBar.svelte';
	import ReviewCard from '#lib/components/ReviewCard.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import { store } from '#lib/cache.ts';
	import { getFriendReviews } from '#lib/data/api.ts';
	import type { Loan } from '#lib/data/models.ts';
	import { keys, PAGE_SIZE } from '#lib/data/pages.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';
	import type { PageProps } from './$types';

	// Every review your friends have written, newest first, loading more as you
	// scroll. Home shows the first few of the same list (and cache entry).
	let { data }: PageProps = $props();

	const reviews = createPaged<Loan>(
		(page) => getFriendReviews(data.userId, { page, pageSize: PAGE_SIZE.friendReviews }),
		PAGE_SIZE.friendReviews,
		{
			seed: untrack(() => data.reviews),
			onChange: (state) => store(keys.friendReviews(data.userId), state)
		}
	);

	// A background refresh of the cached list lands here.
	$effect(() => {
		const fresh = data.reviews;
		untrack(() => reviews.seed(fresh));
	});
</script>

<div class="page">
	<PageBar title={t('Reviews by friends')} />

	{#if reviews.items.length > 0}
		<div class="list">
			{#each reviews.items as loan, i (loan.id)}
				<div in:appear={{ index: i % PAGE_SIZE.friendReviews }}>
					<ReviewCard {loan} showReviewer />
				</div>
			{/each}
		</div>
	{:else if reviews.error}
		<FillCenter><p class="error">{reviews.error}</p></FillCenter>
	{:else if !reviews.loading && !reviews.hasMore}
		<FillCenter>
			<p class="muted">{t('Your friends have not reviewed any books yet.')}</p>
		</FillCenter>
	{/if}

	{#if reviews.loading}
		{#if reviews.items.length === 0}
			<div class="list"><Skeleton kind="loan" count={4} /></div>
		{:else}
			<Loading fill={false} />
		{/if}
	{/if}
	<Sentinel onvisible={reviews.loadMore} />
</div>

<style>
	.page {
		min-height: 100vh;
		padding-bottom: 40px;
	}
	/* The Loans page's list: 10px apart, 5px inset inside the 10px page gutter. */
	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 0 15px;
	}
	.error {
		color: var(--error);
	}
	.muted {
		color: var(--on-surface-variant);
	}
</style>
