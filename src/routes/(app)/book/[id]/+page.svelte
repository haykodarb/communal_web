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
		deleteLoan,
		getBookById,
		getCurrentLoanForBook,
		getReviewsForBook,
		requestLoan
	} from '#lib/data/api.ts';
	import type { Book, Loan } from '#lib/data/models.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';

	// Another user's book (BookForeignPage): request, withdraw or view the loan.
	let book = $state<Book | null>(null);
	let currentLoan = $state<Loan | null>(null);
	let reviews = $state<Loan[]>([]);
	let loading = $state(true);
	let busy = $state(true);
	let error = $state('');

	let confirmDialog: ConfirmDialog;
	let confirmTitle = $state('');

	const id = $derived(page.params.id!);
	const userId = $derived(auth.user!.id);

	async function checkLoanStatus() {
		busy = true;
		currentLoan = await getCurrentLoanForBook(userId, id);
		busy = false;
	}

	$effect(() => {
		loading = true;
		getBookById(id)
			.then((result) => {
				// Your own books live under /my-books.
				if (result?.owner.id === userId) goto(`/my-books/${id}`, { replaceState: true });
				book = result;
			})
			.finally(() => (loading = false));
		checkLoanStatus();
		getReviewsForBook(id).then((loans) => (reviews = loans));
	});

	const requestedByMe = $derived(currentLoan?.loanee.id === userId);

	const statusText = $derived(
		book?.loaned
			? requestedByMe
				? t('Loaned')
				: t('Unavailable')
			: requestedByMe
				? t('Requested')
				: t('Available')
	);

	const addedText = $derived(
		book
			? new Intl.DateTimeFormat(i18n.locale === 'es' ? 'es-ES' : 'en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric'
				}).format(new Date(book.created_at))
			: ''
	);

	async function confirmed(title: string): Promise<boolean> {
		confirmTitle = t(title);
		return confirmDialog.confirm();
	}

	async function onRequest() {
		if (!(await confirmed('Request loan for this book?'))) return;
		busy = true;
		error = '';
		try {
			currentLoan = await requestLoan(userId, id);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
		busy = false;
	}

	async function onWithdraw() {
		if (!currentLoan || !(await confirmed('Withdraw your request for this book?'))) return;
		busy = true;
		error = '';
		try {
			await deleteLoan(currentLoan.id);
			await checkLoanStatus();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			busy = false;
		}
	}
</script>

<div class="detail">
	<button class="back" type="button" aria-label={t('Back')} onclick={() => history.back()}>
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
				<dt>{t('Owner')}</dt>
				<dd><a href={`/profile/${book.owner.id}`}>{book.owner.username}</a></dd>
			</div>
			<div>
				<dt>{t('Added')}</dt>
				<dd>{addedText}</dd>
			</div>
			<div>
				<dt>{t('Status')}</dt>
				<dd>{busy ? '' : statusText}</dd>
			</div>
		</dl>

		{#if book.review}
			<p class="review">{book.review}</p>
		{/if}

		<div class="actions">
			{#if requestedByMe && book.loaned}
				<Button onclick={() => goto(`/loans/${currentLoan!.id}`)}>{t('View loan')}</Button>
			{:else if requestedByMe}
				<Button variant="outlined" loading={busy} onclick={onWithdraw}>
					{t('Withdraw request')}
				</Button>
			{:else}
				<Button loading={busy} onclick={onRequest}>{t('Request')}</Button>
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

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

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
		min-width: 0;
	}
	dt {
		font-size: 12px;
		color: var(--on-surface-variant);
	}
	dd {
		margin: 0;
		font-size: 14px;
		overflow-wrap: anywhere;
	}
	dd a {
		color: var(--secondary);
		font-weight: 600;
		text-decoration: none;
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
