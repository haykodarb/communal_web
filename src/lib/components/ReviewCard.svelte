<script lang="ts">
	import type { Loan } from '#lib/data/models.ts';
	import { i18n } from '#lib/i18n.svelte.ts';
	import Avatar from './Avatar.svelte';
	import CoverImage from './CoverImage.svelte';

	// A review in a list, laid out like LoanCard: the book and the review text
	// on the left, the cover on the right, the date in the top corner. Long
	// reviews clamp to 4 lines (the loan page has the rest). `showReviewer` adds
	// who wrote it as a byline under the text, for lists mixing several people
	// (Home); a profile's Reviews tab leaves it out.
	let { loan, showReviewer = false }: { loan: Loan; showReviewer?: boolean } = $props();

	const dateText = $derived(
		loan.latest_date
			? new Intl.DateTimeFormat(i18n.locale === 'es' ? 'es-ES' : 'en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric'
				}).format(new Date(loan.latest_date))
			: ''
	);
</script>

<a class="rcard pressable" href={`/loans/${loan.id}`}>
	<div class="body">
		<div class="head">
			<div class="book">
				<span class="title">{loan.book.title}</span>
				<span class="author">{loan.book.author}</span>
			</div>
			{#if dateText}<span class="date">{dateText}</span>{/if}
		</div>
		<!-- Pinned to the bottom, so spare space goes between the book and the text. -->
		<div class="foot">
			<p class="review">{loan.review}</p>
			{#if showReviewer}
				<span class="reviewer">
					<Avatar profile={loan.loanee} size={20} />
					<span>{loan.loanee.username}</span>
				</span>
			{/if}
		</div>
	</div>
	<div class="cover">
		<CoverImage bucket="book_covers" path={loan.book.image_path} alt={loan.book.title} />
	</div>
</a>

<style>
	/* Same box as LoanCard. */
	.rcard {
		--padding: 20px;
		--radius: 10px;
		display: flex;
		gap: 10px;
		padding: var(--padding);
		border-radius: var(--radius);
		background: var(--surface-container);
		text-decoration: none;
		color: inherit;
	}
	.body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.foot {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.head {
		display: flex;
		align-items: flex-start;
		gap: 8px;
	}
	.book {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.title {
		font-size: 14px;
		font-weight: 600;
		line-height: 1.2;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.author {
		font-size: 12px;
		line-height: 1.2;
		color: var(--on-surface-variant);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.date {
		flex: 0 0 auto;
		font-size: 12px;
		font-style: italic;
		line-height: 1.2;
		color: var(--on-surface-variant);
	}
	.review {
		font-size: 13px;
		line-height: 1.4;
		white-space: pre-line;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.reviewer {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
		font-size: 12px;
		font-weight: 600;
		color: var(--primary);
	}
	.reviewer span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* LoanCard's cover: concentric with the card, 5px at least. It sets the
	   card's height; the text column stretches to match. */
	.cover {
		width: 96px;
		height: 128px;
		flex: 0 0 96px;
		border-radius: max(5px, var(--radius) - var(--padding));
		overflow: hidden;
	}
</style>
