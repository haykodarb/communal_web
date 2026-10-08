<script lang="ts">
	import type { Book } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { bookHref } from '#lib/links.ts';
	import CoverImage from './CoverImage.svelte';

	// `showLoaned` (My Books) marks loaned books with a ribbon across the
	// cover's top-left corner.
	let { book, showLoaned = false }: { book: Book; showLoaned?: boolean } = $props();
</script>

<a class="vcard pressable" href={bookHref(book)}>
	<div class="cover">
		<CoverImage bucket="book_covers" path={book.image_path} alt={book.title} />
		{#if showLoaned && book.loaned}
			<span class="ribbon">{t('Loaned')}</span>
		{/if}
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
		position: relative;
		width: 100%;
		aspect-ratio: 3 / 4;
		border-radius: 5px;
		overflow: hidden;
	}
	/* A band rotated 45° about its center, which sits 26px in from both edges
	   on the corner's diagonal (leaving ~73px of it showing, room for
	   "PRESTADO"); the cover's overflow clips its ends. In the
	   loaned purple (StatusBadge, BookCard). */
	.ribbon {
		position: absolute;
		top: 26px;
		left: 26px;
		width: 100px;
		translate: -50% -50%;
		rotate: -45deg;
		padding: 2px 0;
		background: var(--tertiary);
		color: var(--on-tertiary);
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-align: center;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
		pointer-events: none;
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
