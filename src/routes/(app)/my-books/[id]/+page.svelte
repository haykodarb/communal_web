<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import CoverImage from '#lib/components/CoverImage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { getBookById } from '#lib/data/api.ts';
	import type { Book } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let book = $state<Book | null>(null);
	let loading = $state(true);

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		loading = true;
		getBookById(id)
			.then((result) => {
				book = result;
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

<div class="detail">
	<button class="back" type="button" aria-label={t('Back')} onclick={() => goto('/my-books')}>
		<Icon name="chevron-left" size={32} />
	</button>

	{#if loading}
		<p class="muted">{t('Loading…')}</p>
	{:else if book}
		<div class="cover">
			<CoverImage bucket="book_covers" path={book.image_path} alt={book.title} />
		</div>
		<h1>{book.title}</h1>
		<p class="author">{book.author}</p>
		<span class="status" class:loaned={book.loaned}>
			<span class="dot"></span>
			{book.loaned ? t('Loaned') : t('Available')}
		</span>
		{#if book.review}
			<p class="review">{book.review}</p>
		{/if}
	{:else}
		<p class="muted">{t('Book not found.')}</p>
	{/if}
</div>

<style>
	.detail {
		padding: 16px 20px 40px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	.back {
		background: none;
		border: none;
		color: var(--on-surface);
		cursor: pointer;
		padding: 0;
		margin-bottom: 12px;
	}
	.cover {
		width: 100%;
		max-width: 280px;
		aspect-ratio: 3 / 4;
		border-radius: 5px;
		overflow: hidden;
		margin: 0 auto 20px;
		box-shadow: 0 6px 18px color-mix(in srgb, var(--shadow) 45%, transparent);
	}
	h1 {
		font-size: 22px;
		font-weight: 700;
		line-height: 1.25;
	}
	.author {
		margin-top: 6px;
		font-size: 14px;
		color: var(--on-surface-variant);
	}
	.status {
		margin-top: 14px;
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
	.review {
		margin-top: 20px;
		font-size: 15px;
		line-height: 1.5;
		color: var(--on-surface-variant);
	}
	.muted {
		color: var(--on-surface-variant);
	}
</style>
