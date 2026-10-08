<script lang="ts">
	import FillCenter from '#lib/components/FillCenter.svelte';
	import { goto } from '$app/navigation';
	import BookDetail from '#lib/components/BookDetail.svelte';
	import Button from '#lib/components/Button.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import {
		deleteLoan,
		getCurrentLoanForBook,
		joinWaitlist,
		leaveWaitlist,
		requestLoan
	} from '#lib/data/api.ts';
	import type { Book, Loan } from '#lib/data/models.ts';
	import { formatMediumDate } from '#lib/format.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { toast } from '#lib/toast.svelte.ts';
	import type { PageProps } from './$types';

	// Another user's book (BookForeignPage): request, withdraw or view the loan.
	// It comes from the load (through the page cache).
	let { data }: PageProps = $props();
	const book = $derived<Book | null>(data.details.book);
	let currentLoan = $derived<Loan | null>(data.details.currentLoan);
	const reviews = $derived(data.details.reviews);
	let waitlisted = $derived(data.details.waitlisted);
	let busy = $state(false);
	let error = $state('');

	let confirmDialog: ConfirmDialog;
	let confirmTitle = $state('');

	const id = $derived(data.details.book?.id ?? '');
	const userId = $derived(data.userId);

	async function checkLoanStatus() {
		busy = true;
		currentLoan = await getCurrentLoanForBook(userId, id);
		busy = false;
	}

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
			toast.show(t('Loan requested'));
		} catch (e) {
			error = errorMessage(e);
		}
		busy = false;
	}

	/** "Notify me when available" on a book someone else has borrowed. */
	async function onToggleWaitlist() {
		busy = true;
		error = '';
		try {
			if (waitlisted) await leaveWaitlist(userId, id);
			else await joinWaitlist(userId, id);
			waitlisted = !waitlisted;
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

	const pageTitle = $derived(`${book?.title ?? t('Book')} · Communal`);
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

{#if book}
	<BookDetail
		{book}
		{reviews}
		reviewCount={data.details.reviewCount}
		large
		info={[
			busy
				? { label: t('Status'), value: '' }
				: {
						label: t('Status'),
						value: statusText,
						tone: book.loaned ? 'loaned' : requestedByMe ? 'requested' : 'available'
					},
			{ label: t('Added'), value: formatMediumDate(book.created_at, i18n.locale) },
			{ label: t('Owner'), value: book.owner.username, person: book.owner }
		]}
	>
		{#snippet actions()}
			{#if requestedByMe && book!.loaned}
				<Button onclick={() => goto(`/loans/${currentLoan!.id}`)}>{t('View loan')}</Button>
			{:else if book!.loaned}
				<Button variant={waitlisted ? 'outlined' : 'filled'} loading={busy} onclick={onToggleWaitlist}>
					{waitlisted ? t('Stop notifying me') : t('Notify me when available')}
				</Button>
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
	<FillCenter><p class="muted">{t('Book not found.')}</p></FillCenter>
{/if}

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	/* Floats over the reviews with the actions, so it gets a backing. */
	.error-text {
		align-self: center;
		padding: 4px 10px;
		border-radius: 10px;
		background: var(--surface-container);
		text-align: center;
		font-size: 14px;
		color: var(--error);
	}
	.muted {
		padding: 20px;
		color: var(--on-surface-variant);
	}
</style>
