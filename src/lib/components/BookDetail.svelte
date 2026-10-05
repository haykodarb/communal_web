<script lang="ts">
	import type { Snippet } from 'svelte';
	import Avatar from './Avatar.svelte';
	import CoverImage from './CoverImage.svelte';
	import Icon from './Icon.svelte';
	import type { Book, Loan, Profile } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { profileHref } from '#lib/links.ts';

	// Shared layout of BookOwnedPage / BookForeignPage: one screen tall, cover on
	// top of a rounded card, title, a pill of facts, a review carousel and the
	// action buttons at the bottom.
	let {
		book,
		reviews,
		info,
		onback,
		actions
	}: {
		book: Book;
		/** Completed loans with a review. */
		reviews: Loan[];
		info: { label: string; value: string }[];
		onback: () => void;
		actions: Snippet;
	} = $props();

	// The owner's own review comes first, as in Flutter.
	const cards = $derived<{ author: Profile; text: string }[]>([
		...(book.review ? [{ author: book.owner, text: book.review }] : []),
		...reviews.map((loan) => ({ author: loan.loanee, text: loan.review ?? '' }))
	]);

	let index = $state(0);
	const current = $derived(cards[Math.min(index, cards.length - 1)]);
</script>

<div class="detail">
	<div class="card-bg" aria-hidden="true"></div>

	<button class="back" type="button" aria-label={t('Back')} onclick={onback}>
		<Icon name="chevron-left" size={28} />
	</button>

	<div class="content">
		<div class="cover-wrap">
			<CoverImage bucket="book_covers" path={book.image_path} alt={book.title} />
		</div>

		<div class="title">
			<h1>{book.title}</h1>
			<p class="author">{book.author}</p>
		</div>

		<dl class="info">
			{#each info as item (item.label)}
				<div>
					<dt>{item.label}</dt>
					<dd>{item.value}</dd>
				</div>
			{/each}
		</dl>

		<section class="reviews" aria-label={t('Reviews')}>
			{#if cards.length === 0}
				<p class="no-reviews">{t('No reviews')}</p>
			{:else}
				<div class="carousel">
					<button
						class="nav"
						type="button"
						aria-label={t('Previous')}
						disabled={index === 0}
						onclick={() => (index -= 1)}
					>
						<Icon name="chevron-left" size={22} />
					</button>
					<article class="review">
						<a class="reviewer" href={profileHref(current.author)}>
							<Avatar profile={current.author} size={30} />
							<span>{current.author.username}</span>
						</a>
						<p>{current.text}</p>
					</article>
					<button
						class="nav"
						type="button"
						aria-label={t('Next')}
						disabled={index >= cards.length - 1}
						onclick={() => (index += 1)}
					>
						<Icon name="chevron-right" size={22} />
					</button>
				</div>
				{#if cards.length >= 2}
					<div class="dots">
						{#each cards as _, i (i)}
							<span class="dot" class:active={i === index}></span>
						{/each}
					</div>
				{/if}
			{/if}
		</section>

		<div class="actions">{@render actions()}</div>
	</div>
</div>

<style>
	.detail {
		position: relative;
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
	}
	@media (max-width: 799px) {
		.detail {
			height: calc(100dvh - 56px);
		}
	}
	/* Flutter: the bottom 4/5 of the page is a card with 30px top corners. */
	.card-bg {
		position: absolute;
		inset: 20% 0 0;
		border-radius: 30px 30px 0 0;
		background: var(--surface-container);
	}
	.back {
		position: relative;
		align-self: flex-start;
		display: flex;
		margin: 10px 12px 0;
		padding: 4px;
		border: none;
		background: none;
		color: var(--on-surface);
		cursor: pointer;
	}
	.content {
		position: relative;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 0 20px 20px;
	}
	.cover-wrap {
		flex: 4 1 0;
		min-height: 0;
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
		flex: 2 1 0;
		min-height: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 10px;
	}
	.no-reviews {
		text-align: center;
		font-size: 18px;
		color: var(--on-surface-variant);
	}
	.carousel {
		min-height: 0;
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.nav {
		display: flex;
		padding: 6px;
		border: none;
		background: none;
		color: var(--on-surface);
		cursor: pointer;
	}
	.nav:disabled {
		visibility: hidden;
	}
	.review {
		flex: 1;
		min-width: 0;
		max-height: 100%;
		overflow-y: auto;
		padding: 12px 15px;
		border-radius: 5px;
		background: var(--surface);
	}
	.reviewer {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--primary);
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
	}
	.review p {
		margin-top: 8px;
		font-size: 13px;
		line-height: 1.4;
		white-space: pre-line;
	}
	.dots {
		display: flex;
		justify-content: center;
		gap: 6px;
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--primary) 25%, transparent);
	}
	.dot.active {
		background: var(--primary);
	}
	.actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
</style>
