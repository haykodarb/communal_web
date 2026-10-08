<script lang="ts" module>
	import type { Profile } from '#lib/data/models.ts';
	import type { StatusTone } from './StatusBadge.svelte';

	/** One cell of the info pill under the title. */
	export interface InfoItem {
		label: string;
		value: string;
		/** Shows a person (avatar and name, linking to them) instead of `value`. */
		person?: Profile;
		/** Shows the value as a coloured status badge. */
		tone?: StatusTone;
	}
</script>

<script lang="ts">
	import { onMount, untrack, type Snippet } from 'svelte';
	import BackButton from './BackButton.svelte';
	import CoverImage from './CoverImage.svelte';
	import Loading from './Loading.svelte';
	import ReviewItem from './ReviewItem.svelte';
	import Sentinel from './Sentinel.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import UserLink from './UserLink.svelte';
	import { store } from '#lib/cache.ts';
	import { getReviewsForBook } from '#lib/data/api.ts';
	import type { Book, Loan } from '#lib/data/models.ts';
	import { keys, PAGE_SIZE } from '#lib/data/pages.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { afterExitAnimation } from '#lib/motion.ts';
	import { createPaged, type PagedState } from '#lib/paged.svelte.ts';

	// Shared layout of BookOwnedPage / BookForeignPage. The page scrolls as a
	// whole: the cover, title and info pill scroll away, and once the title is
	// out of view a compact bar (back, a thumbnail, title and author) takes over
	// at the top, so the reviews get most of the screen. The action buttons stay
	// pinned at the bottom.
	let {
		book,
		reviews,
		reviewCount = 0,
		info,
		large = false,
		actions
	}: {
		book: Book;
		/** First page of the completed loans with a review (from the page cache). */
		reviews: PagedState<Loan>;
		/** How many readers reviewed it (the owner's own review is added on top). */
		reviewCount?: number;
		info: InfoItem[];
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

	// The heading's count: readers' reviews plus the owner's own, if any.
	const totalReviews = $derived(reviewCount + (book.review ? 1 : 0));

	// Tapping the cover shows it large over a dimmed page (Flutter's
	// expandOnTap); a click anywhere or Escape closes it.
	let lightbox: HTMLDialogElement;
	const openCover = () => lightbox.showModal();
	const closeCover = () => afterExitAnimation(lightbox, 'closing', () => lightbox.close());

	/** The compact bar's height; it shows once the title has gone under it. */
	const BAR_HEIGHT = 56;
	let titleEl: HTMLElement;
	let compact = $state(false);
	const onScroll = () => {
		if (titleEl) compact = titleEl.getBoundingClientRect().bottom < BAR_HEIGHT;
	};
	onMount(onScroll);
</script>

<svelte:window onscroll={onScroll} />

<div class="detail" style:--bar={`${BAR_HEIGHT}px`}>
	<!-- Takes no space; overlays the top of the page once the title is gone. -->
	<div class="bar" class:shown={compact} aria-hidden={!compact} inert={!compact}>
		<BackButton />
		<span class="thumb">
			<CoverImage bucket="book_covers" path={book.image_path} alt="" />
		</span>
		<span class="bar-text">
			<span class="bar-title">{book.title}</span>
			<span class="bar-author">{book.author}</span>
		</span>
	</div>

	<header class="header">
		<div class="menu"><BackButton /></div>

		<button class="cover-wrap" type="button" aria-label={t('View cover')} onclick={openCover}>
			<CoverImage bucket="book_covers" path={book.image_path} alt={book.title} />
		</button>

		<div class="title" class:large bind:this={titleEl}>
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
						{#if item.tone}
							<StatusBadge tone={item.tone} label={item.value} />
						{:else if item.person}
							<UserLink profile={item.person} />
						{:else}
							{item.value}
						{/if}
					</dd>
				</div>
			{/each}
		</dl>

		<!-- With no reviews at all, the section is left out entirely. -->
		{#if !empty}
			<h2 class="reviews-heading" id="reviews-heading">
				{t('Reviews')}{#if totalReviews > 0}<span class="count">· {totalReviews}</span>{/if}
			</h2>
			<section class="reviews" aria-labelledby="reviews-heading">
				{#if book.review}
					<ReviewItem author={book.owner} text={book.review} tag={t("Owner's note")} />
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
			</section>
		{/if}
	</div>

	<div class="actions">{@render actions()}</div>
</div>

<dialog
	class="lightbox"
	bind:this={lightbox}
	aria-label={book.title}
	onclick={closeCover}
	oncancel={(event) => {
		event.preventDefault();
		closeCover();
	}}
>
	<CoverImage bucket="book_covers" path={book.image_path} alt={book.title} />
</dialog>

<style>
	.detail {
		/* Space above the cover, and the cover's height. */
		--cover-gap: 5vh;
		--cover: 46dvh;
		position: relative;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		/* The header and content paint their own backgrounds; this one shows
		   only around the floating actions, continuing the content's. */
		background: var(--surface-container);
	}
	/* The compact bar: sticky at the top but taking no room (the negative
	   margin), hidden until the title scrolls under it, then fading and sliding
	   in with a soft drop shadow (as on the chat bar) so the reviews pass
	   under it. */
	.bar {
		position: sticky;
		top: 0;
		z-index: 3;
		height: var(--bar);
		margin-bottom: calc(-1 * var(--bar));
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 16px 0 8px;
		background: var(--surface-container);
		box-shadow: 0 3px 12px color-mix(in srgb, var(--shadow) 75%, transparent);
		opacity: 0;
		transform: translateY(-8px);
		pointer-events: none;
		transition:
			opacity 180ms var(--ease-standard),
			transform 180ms var(--ease-standard);
	}
	.bar.shown {
		opacity: 1;
		transform: none;
		pointer-events: auto;
	}
	.thumb {
		flex: 0 0 30px;
		height: 40px;
		border-radius: 4px;
		overflow: hidden;
	}
	.bar-text {
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.bar-title,
	.bar-author {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.bar-title {
		font-size: 14px;
		font-weight: 600;
		line-height: 1.3;
	}
	.bar-author {
		font-size: 12px;
		color: var(--on-surface-variant);
	}
	/* The cover and title scroll away with the page. The beige shows behind the
	   cover's top half; the near-white card starts at its midpoint. */
	.header {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: var(--cover-gap) 20px 0;
		background: var(--surface);
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
	/* The cover is a button that opens the lightbox. */
	.cover-wrap {
		align-self: center;
		height: var(--cover);
		display: flex;
		justify-content: center;
		padding: 0;
		border: none;
		border-radius: 5px;
		background: none;
		cursor: zoom-in;
	}
	.cover-wrap::after {
		display: none;
	}
	.lightbox {
		max-width: none;
		max-height: none;
		margin: auto;
		padding: 0;
		border: none;
		border-radius: 8px;
		overflow: hidden;
		background: none;
		cursor: zoom-out;
	}
	.lightbox :global(.cover) {
		display: block;
		height: min(90vh, calc(90vw * 4 / 3));
		width: auto;
		aspect-ratio: 3 / 4;
		object-fit: cover;
	}
	.lightbox::backdrop {
		background: rgba(0, 0, 0, 0.75);
	}
	.lightbox[open] {
		animation: lightbox-in 200ms var(--ease-standard);
	}
	.lightbox[open]::backdrop {
		animation: backdrop-in 200ms ease;
	}
	.lightbox:global(.closing) {
		animation: lightbox-out 160ms ease-in forwards;
	}
	.lightbox:global(.closing)::backdrop {
		animation: backdrop-out 160ms ease-in forwards;
	}
	@keyframes lightbox-in {
		from {
			opacity: 0;
			transform: scale(0.92);
		}
	}
	@keyframes lightbox-out {
		to {
			opacity: 0;
			transform: scale(0.92);
		}
	}
	@keyframes backdrop-in {
		from {
			opacity: 0;
		}
	}
	@keyframes backdrop-out {
		to {
			opacity: 0;
		}
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
		font-size: 18px;
		font-weight: 600;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.author {
		font-size: 16px;
		color: var(--on-surface-variant);
	}
	.large h1 {
		font-size: 24px;
	}
	.large .author {
		font-size: 20px;
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
	/* Three centred cells in a faintly outlined pill (no fill), separated by
	   faint dividers. */
	.info {
		flex: 0 0 65px;
		margin: 0;
		padding: 0 12px;
		/* border: 1px solid color-mix(in srgb, var(--on-surface) 14%, transparent); */
		border-radius: 10px;
		display: flex;
		align-items: center;
	}
	.info > div {
		position: relative;
		flex: 1;
		min-width: 0;
		text-align: center;
	}
	/* Faint dividers between the cells. */
	.info > div + div::before {
		content: '';
		position: absolute;
		top: 18%;
		bottom: 18%;
		left: 0;
		width: 1px;
		background: color-mix(in srgb, var(--on-surface) 12%, transparent);
	}
	/* Small caps-style labels, so the values read first. */
	dt {
		margin-bottom: 4px;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--on-surface-variant) 85%, transparent);
	}
	dd {
		margin: 0;
		padding: 0 6px;
		font-size: 15px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* Separates the reviews from the book's facts above. */
	.reviews-heading {
		margin-top: 14px;
		font-size: 16px;
		font-weight: 600;
	}
	.reviews-heading .count {
		margin-left: 6px;
		font-weight: 400;
		color: var(--on-surface-variant);
	}
	.reviews {
		display: flex;
		flex-direction: column;
		gap: 14px;
		/* Separation from the pinned CTA row. */
		padding-bottom: 20px;
	}
	/* A very subtle divider between reviews. */
	.reviews > :global(article) + :global(article) {
		padding-top: 14px;
		border-top: 1px solid color-mix(in srgb, var(--on-surface) 8%, transparent);
	}
	/* A little air above the first review, to separate it from the info pill. */
	.reviews > :global(article:first-child) {
		padding-top: 6px;
	}
	.error-text {
		font-size: 13px;
		color: var(--error);
	}
	/* Pinned at the bottom of the viewport. The space above it lives in
	   .reviews so the buttons hug the edges. Transparent around the buttons,
	   so they float over the reviews scrolling behind them. */
	.actions {
		position: sticky;
		bottom: 0;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 5px 10px 10px;
	}
	/* The outlined and tonal buttons are see-through; give them the solid
	   colour they had over the old backing so the reviews don't show through. */
	.actions :global(.btn.outlined) {
		background: var(--surface-container);
	}
	.actions :global(.btn.tonal) {
		background: color-mix(in srgb, var(--primary) 15%, var(--surface-container));
	}
</style>
