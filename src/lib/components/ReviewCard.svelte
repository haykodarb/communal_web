<script lang="ts">
	import type { Loan } from '#lib/data/models.ts';
	import { i18n } from '#lib/i18n.svelte.ts';
	import CoverImage from './CoverImage.svelte';

	let { loan }: { loan: Loan } = $props();

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

<a class="rcard" href={`/app/loans/${loan.id}`}>
	<div class="top">
		<div class="info">
			<span class="title">{loan.book.title}</span>
			<span class="author">{loan.book.author}</span>
			<span class="date">{dateText}</span>
		</div>
		<div class="cover">
			<CoverImage bucket="book_covers" path={loan.book.image_path} alt={loan.book.title} />
		</div>
	</div>
	<p class="review">{loan.review}</p>
</a>

<style>
	.rcard {
		display: block;
		padding: 20px;
		border-radius: 10px;
		background: var(--surface-container);
		text-decoration: none;
		color: inherit;
	}
	.top {
		display: flex;
		gap: 12px;
	}
	.info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.title {
		font-size: 16px;
		font-weight: 600;
		line-height: 1.2;
	}
	.author {
		font-size: 14px;
		line-height: 1.2;
		color: var(--on-surface-variant);
	}
	.date {
		font-size: 14px;
		font-style: italic;
		line-height: 1.2;
		color: var(--on-surface-variant);
	}
	.cover {
		width: 75px;
		height: 100px;
		flex: 0 0 75px;
		border-radius: 5px;
		overflow: hidden;
	}
	.review {
		margin-top: 20px;
		font-size: 14px;
		line-height: 1.4;
	}
</style>
