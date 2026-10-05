<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Button from '#lib/components/Button.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import CoverImage from '#lib/components/CoverImage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import ReviewCard from '#lib/components/ReviewCard.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import {
		deleteBook,
		getBookById,
		getCurrentLoanForBook,
		getReviewsForBook
	} from '#lib/data/api.ts';
	import type { Book, Loan } from '#lib/data/models.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';

	let book = $state<Book | null>(null);
	let currentLoan = $state<Loan | null>(null);
	let reviews = $state<Loan[]>([]);
	let loading = $state(true);
	let deleting = $state(false);
	let error = $state('');
	let confirmDialog: ConfirmDialog;

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
		getCurrentLoanForBook(auth.user!.id, id).then((loan) => (currentLoan = loan));
		getReviewsForBook(id).then((loans) => (reviews = loans));
	});

	const addedText = $derived(
		book
			? new Intl.DateTimeFormat(i18n.locale === 'es' ? 'es-ES' : 'en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric'
				}).format(new Date(book.created_at))
			: ''
	);

	async function onDelete() {
		if (!book || !(await confirmDialog.confirm())) return;
		deleting = true;
		error = '';
		try {
			await deleteBook(book);
			await goto('/my-books', { replaceState: true });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			deleting = false;
		}
	}
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

		<dl class="info">
			<div>
				<dt>{t('Added')}</dt>
				<dd>{addedText}</dd>
			</div>
			<div>
				<dt>{t('Visibility')}</dt>
				<dd>{book.public ? t('Public') : t('Private')}</dd>
			</div>
			<div>
				<dt>{t('Status')}</dt>
				<dd>
					<span class="status" class:loaned={book.loaned}>
						<span class="dot"></span>
						{book.loaned ? t('Loaned') : t('Available')}
					</span>
				</dd>
			</div>
		</dl>

		{#if book.review}
			<p class="review">{book.review}</p>
		{/if}

		<div class="actions">
			{#if !book.loaned || !book.public}
				<div class="row">
					<Button onclick={() => goto(`/my-books/${book!.id}/edit`)}>{t('Edit')}</Button>
					<Button variant="tonal" loading={deleting} onclick={onDelete}>{t('Delete')}</Button>
				</div>
			{/if}
			{#if book.loaned && currentLoan}
				<Button onclick={() => goto(`/loans/${currentLoan!.id}`)}>{t('View loan')}</Button>
			{/if}
			{#if error}
				<p class="error-text">{error}</p>
			{/if}
		</div>

		<h2>{t('Reviews')}</h2>
		{#if reviews.length > 0}
			<div class="reviews">
				{#each reviews as loan (loan.id)}
					<ReviewCard {loan} />
				{/each}
			</div>
		{:else}
			<p class="muted">{t('No reviews')}</p>
		{/if}
	{:else}
		<p class="muted">{t('Book not found.')}</p>
	{/if}
</div>

<ConfirmDialog bind:this={confirmDialog} title={t('Delete book?')} />

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
	h2 {
		margin-top: 32px;
		margin-bottom: 12px;
		font-size: 18px;
		font-weight: 700;
	}
	.author {
		margin-top: 6px;
		font-size: 14px;
		color: var(--on-surface-variant);
	}
	.info {
		margin-top: 20px;
		width: 100%;
		display: flex;
		justify-content: space-between;
		gap: 12px;
	}
	.info div {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	dt {
		font-size: 12px;
		color: var(--on-surface-variant);
	}
	dd {
		margin: 0;
		font-size: 14px;
	}
	.status {
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
	.actions {
		margin-top: 24px;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.row {
		display: flex;
		gap: 20px;
	}
	.reviews {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.error-text {
		text-align: center;
		font-size: 14px;
		color: var(--error);
	}
	.muted {
		color: var(--on-surface-variant);
	}
</style>
