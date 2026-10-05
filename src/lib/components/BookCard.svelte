<script lang="ts">
	import type { Book } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import CoverImage from './CoverImage.svelte';

	let { book }: { book: Book } = $props();
</script>

<a class="card" href={`/my-books/${book.id}`}>
	<div class="cover">
		<CoverImage bucket="book_covers" path={book.image_path} alt={book.title} />
	</div>
	<div class="body">
		<span class="title">{book.title}</span>
		<span class="author">{book.author}</span>
		<span class="spacer"></span>
		<span class="status" class:loaned={book.loaned}>
			<span class="dot"></span>
			{book.loaned ? t('Loaned') : t('Available')}
		</span>
	</div>
</a>

<style>
	.card {
		display: flex;
		height: 200px;
		border-radius: 10px;
		overflow: hidden;
		background: var(--surface-container);
		text-decoration: none;
		color: inherit;
	}
	.cover {
		width: 150px;
		flex: 0 0 150px;
		overflow: hidden;
	}
	.body {
		flex: 1;
		min-width: 0;
		padding: 20px;
		display: flex;
		flex-direction: column;
	}
	.title {
		font-size: 14px;
		font-weight: 600;
		line-height: 1.25;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.author {
		margin-top: 5px;
		font-size: 12px;
		font-weight: 400;
		line-height: 1.25;
		color: var(--on-surface-variant);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.spacer {
		flex: 1;
	}
	.status {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		height: 30px;
		padding: 0 10px;
		border-radius: 5px;
		font-size: 14px;
		background: color-mix(in srgb, #7dae6b 25%, transparent);
	}
	.status.loaned {
		background: color-mix(in srgb, var(--tertiary) 25%, transparent);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #7dae6b;
	}
	.status.loaned .dot {
		background: var(--tertiary);
	}
</style>
