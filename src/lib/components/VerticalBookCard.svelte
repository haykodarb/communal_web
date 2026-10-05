<script lang="ts">
	import type { Book } from '#lib/data/models.ts';
	import CoverImage from './CoverImage.svelte';

	let { book }: { book: Book } = $props();
</script>

<a class="vcard" href={`/my-books/${book.id}`}>
	<div class="cover">
		<CoverImage bucket="book_covers" path={book.image_path} alt={book.title} />
	</div>
	<span class="title">{book.title}</span>
	<span class="author">{book.author}</span>
</a>

<style>
	.vcard {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		padding: 10px;
		border-radius: 10px;
		background: var(--surface-container);
		text-decoration: none;
		color: inherit;
	}
	.cover {
		width: 100%;
		aspect-ratio: 3 / 4;
		border-radius: 5px;
		overflow: hidden;
	}
	.title {
		margin-top: 5px;
		font-size: 12px;
		font-weight: 600;
		line-height: 1.2;
		text-align: center;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.author {
		font-size: 10px;
		font-weight: 500;
		line-height: 1.2;
		color: var(--on-surface-variant);
		text-align: center;
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
