<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import BookDetail from '#lib/components/BookDetail.svelte';
	import Button from '#lib/components/Button.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import {
		deleteLoan,
		getBookById,
		getCurrentLoanForBook,
		getReviewsForBook,
		requestLoan
	} from '#lib/data/api.ts';
	import type { Book, Loan } from '#lib/data/models.ts';
	import { formatShortDate } from '#lib/format.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';

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
				if (result?.owner.id === userId) goto(`/my-books/${id}`, { replace: true });
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
			error = errorMessage(e);
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
			error = errorMessage(e);
			busy = false;
		}
	}
</script>

{#if book}
	<BookDetail
		{book}
		{reviews}
		large
		onback={() => history.back()}
		info={[
			{ label: t('Owner'), value: book.owner.username, href: `/profile/${book.owner.id}` },
			{ label: t('Added'), value: formatShortDate(book.created_at) },
			{ label: t('Status'), value: busy ? '' : statusText }
		]}
	>
		{#snippet actions()}
			{#if requestedByMe && book!.loaned}
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
		{/snippet}
	</BookDetail>
{:else}
	<p class="muted">{loading ? t('Loading…') : t('Book not found.')}</p>
{/if}

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	.error-text {
		text-align: center;
		font-size: 14px;
		color: var(--error);
	}
	.muted {
		padding: 20px;
		color: var(--on-surface-variant);
	}
</style>
