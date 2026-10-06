<script lang="ts">
	import { onMount, untrack, type Snippet } from 'svelte';
	import BackButton from './BackButton.svelte';
	import CoverImage from './CoverImage.svelte';
	import Loading from './Loading.svelte';
	import ReviewItem from './ReviewItem.svelte';
	import Sentinel from './Sentinel.svelte';
	import { store } from '#lib/cache.ts';
	import { getReviewsForBook } from '#lib/data/api.ts';
	import type { Book, Loan } from '#lib/data/models.ts';
	import { keys, PAGE_SIZE } from '#lib/data/pages.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged, type PagedState } from '#lib/paged.svelte.ts';

	// Shared layout of BookOwnedPage / BookForeignPage. The page scrolls as a
	// whole: the cover and title stay (sticky) and shrink to a point as you
	// scroll, the info row scrolls away and the action buttons stay pinned.
	let {
		book,
		reviews,
		info,
		large = false,
		actions
	}: {
		book: Book;
		/** First page of the completed loans with a review (from the page cache). */
		reviews: PagedState<Loan>;
		info: { label: string; value: string; href?: string }[];
		/** BookForeignPage uses a bigger title (24/20 vs 18/16). */
		large?: boolean;
		actions: Snippet;
	} = $props();

	// The rest of the pages load on scroll; every page is kept in the cache.
	const paged = createPaged<Loan>(
		(page) => getReviewsForBook(book.id, { page, pageSize: PAGE_SIZE.bookReviews }),
		PAGE_SIZE.bookReviews,
		{
			seed: untrack(() => reviews),
			onChange: (state) => store(keys.bookReviews(book.id), state)
		}
	);

	// A background refresh of the cached reviews lands here.
	$effect(() => {
		const fresh = reviews;
		untrack(() => paged.seed(fresh));
	});

	// The owner's own review has no date and is shown first, as in Flutter.
	const empty = $derived(
		!book.review && paged.items.length === 0 && !paged.loading && !paged.hasMore
	);

	// 0 (expanded) to 1 (collapsed): the header shrinks over one full page of
	// scrolling; the elevation shadow ramps up much sooner.
	let progress = $state(0);
	let shadow = $state(0);
	const onScroll = () => {
		const y = window.scrollY;
		progress = Math.min(1, Math.max(0, y / window.innerHeight));
		shadow = Math.min(1, Math.max(0, y / 60));
	};
	onMount(onScroll);
</script>

<svelte:window onscroll={onScroll} />

<div class="detail" style:--p={progress} style:--s={shadow}>
	<header class="header">
		<div class="menu"><BackButton /></div>

		<div class="cover-wrap">
			<CoverImage bucket="book_covers" path={book.image_path} alt={book.title} />
		</div>

		<div class="title" class:large>
			<h1>{book.title}</h1>
			<p class="author">{book.author}</p>
		</div>
	</header>

	<div class="content">
		<dl class="info">
			{#each info as item (item.label)}
				<div>
					<dt>{item.label}</dt>
					<dd>
						{#if item.href}<a href={item.href}>{item.value}</a>{:else}{item.value}{/if}
					</dd>
				</div>
			{/each}
		</dl>

		<section class="reviews" aria-label={t('Reviews')}>
			{#if empty}
				<p class="no-reviews">{t('No reviews')}</p>
			{:else}
				{#if book.review}
					<ReviewItem author={book.owner} text={book.review} plain />
				{/if}
				{#each paged.items as loan (loan.id)}
					<ReviewItem author={loan.loanee} text={loan.review ?? ''} date={loan.latest_date} />
				{/each}
				{#if paged.error}
					<p class="error-text">{paged.error}</p>
				{/if}
				{#if paged.loading}
					<Loading size={20} inline />
				{/if}
				<Sentinel onvisible={paged.loadMore} />
			{/if}
		</section>
	</div>

	<div class="actions">{@render actions()}</div>
</div>

<style>
	.detail {
		/* 0 (fully expanded) to 1 (collapsed); set from the page scroll. */
		--p: 0;
		/* Header elevation cue, ramped up much faster than --p. */
		--s: 0;
		/* Space above the cover, and the cover's height as the header collapses. */
		--cover-gap: 5vh;
		--cover: calc(46dvh * (1 - 0.4 * var(--p)));
		position: relative;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--surface);
	}
	/* Sticky collapsing header: cover + title stay, shrinking to a point. The
	   beige shows behind the cover's top half; a rounded card layer starts at the
	   cover's midpoint (tracking the shrink) and masks the content sliding under. */
	.header {
		position: sticky;
		top: 0;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: calc(20px - 10px * var(--p));
		padding: var(--cover-gap) 20px 0;
		background: var(--surface);
		/* Elevation cue (hairline + soft shadow) that fades in quickly as you
		   scroll, so the list clearly passes under the header. */
		box-shadow:
			0 2px 0 color-mix(in srgb, var(--on-surface) calc(8% * var(--s)), transparent),
			0 2px 10px color-mix(in srgb, var(--shadow) calc(50% * var(--s)), transparent);
	}
	.header::before {
		content: '';
		position: absolute;
		top: calc(var(--cover-gap) + var(--cover) / 2);
		right: 0;
		bottom: 0;
		left: 0;
		z-index: -1;
		border-radius: 30px 30px 0 0;
		background: var(--surface-container);
	}
	.menu {
		position: absolute;
		top: 6px;
		left: 8px;
		z-index: 1;
	}
	.cover-wrap {
		height: var(--cover);
		display: flex;
		justify-content: center;
	}
	.cover-wrap :global(.cover) {
		width: auto;
		height: 100%;
		aspect-ratio: 3 / 4;
		object-fit: cover;
		border-radius: 5px;
		box-shadow: 2px 1px 20px 12px var(--surface);
	}
	.title {
		padding: 0 10px;
		text-align: center;
	}
	h1 {
		font-size: calc(18px * (1 - 0.3 * var(--p)));
		font-weight: 600;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.author {
		font-size: calc(16px * (1 - 0.3 * var(--p)));
		color: var(--on-surface-variant);
	}
	.large h1 {
		font-size: calc(24px * (1 - 0.3 * var(--p)));
	}
	.large .author {
		font-size: calc(20px * (1 - 0.3 * var(--p)));
	}
	/* The info pill and reviews sit on the near-white card. */
	.content {
		position: relative;
		z-index: 1;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 20px 20px 0;
		background: var(--surface-container);
	}
	dd a {
		color: var(--primary);
		text-decoration: none;
	}
	/* Flutter: 65px pill, radius 40, three centered columns. */
	.info {
		flex: 0 0 65px;
		margin: 0;
		padding: 0 20px;
		border-radius: 40px;
		background: var(--surface);
		display: flex;
		align-items: center;
	}
	.info div {
		flex: 1;
		min-width: 0;
		text-align: center;
	}
	dt {
		font-size: 12px;
		color: var(--on-surface-variant);
	}
	dd {
		margin: 0;
		font-size: 16px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.reviews {
		display: flex;
		flex-direction: column;
		gap: 10px;
		/* Separation from the pinned CTA row. */
		padding-bottom: 20px;
	}
	/* A very subtle divider between reviews. */
	.reviews > :global(article) + :global(article) {
		padding-top: 10px;
		border-top: 1px solid color-mix(in srgb, var(--on-surface) 8%, transparent);
	}
	/* A little air above the first review, to separate it from the info pill. */
	.reviews > :global(article:first-child) {
		padding-top: 6px;
	}
	.no-reviews {
		padding: 30px 0;
		text-align: center;
		font-size: 18px;
		color: var(--on-surface-variant);
	}
	.error-text {
		font-size: 13px;
		color: var(--error);
	}
	/* Pinned at the bottom of the viewport. The space above it lives in
	   .reviews so the buttons hug the edges. */
	.actions {
		position: sticky;
		bottom: 0;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 5px;
		background: var(--surface-container);
	}
</style>
