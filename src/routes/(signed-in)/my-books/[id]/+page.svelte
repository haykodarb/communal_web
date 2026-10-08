<script lang="ts">
	import FillCenter from '#lib/components/FillCenter.svelte';
	import { goto } from '$app/navigation';
	import BookDetail from '#lib/components/BookDetail.svelte';
	import Button from '#lib/components/Button.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import { deleteBook } from '#lib/data/api.ts';
	import type { Book, Loan } from '#lib/data/models.ts';
	import { formatMediumDate } from '#lib/format.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { toast } from '#lib/toast.svelte.ts';
	import type { PageProps } from './$types';

	// BookOwnedPage. It comes from the load (through the page cache).
	let { data }: PageProps = $props();
	const book = $derived<Book | null>(data.details.book);
	const currentLoan = $derived<Loan | null>(data.details.currentLoan);
	const reviews = $derived(data.details.reviews);
	let deleting = $state(false);
	let error = $state('');
	let confirmDialog: ConfirmDialog;

	async function onDelete() {
		if (!book || !(await confirmDialog.confirm())) return;
		deleting = true;
		error = '';
		try {
			await deleteBook(book);
			await goto('/my-books', { replace: true });
			toast.show(t('Book deleted'));
		} catch (e) {
			error = errorMessage(e);
			deleting = false;
		}
	}

	const pageTitle = $derived(`${book?.title ?? t('My Books')} · Communal`);
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
			{
				label: t('Status'),
				value: book.loaned ? t('Loaned') : t('Available'),
				tone: book.loaned ? 'loaned' : 'available'
			},
			{ label: t('Added'), value: formatMediumDate(book.created_at, i18n.locale) },
			{ label: t('Visibility'), value: book.public ? t('Public') : t('Private') }
		]}
	>
		{#snippet actions()}
			{#if !book!.loaned || !book!.public}
				<div class="row">
					<Button onclick={() => goto(`/my-books/${book!.id}/edit`)}>{t('Edit')}</Button>
					<Button variant="tonal" loading={deleting} onclick={onDelete}>{t('Delete')}</Button>
				</div>
			{/if}
			{#if book!.loaned && currentLoan}
				<Button onclick={() => goto(`/loans/${currentLoan!.id}`)}>{t('View loan')}</Button>
			{/if}
			{#if error}
				<p class="error-text">{error}</p>
			{/if}
		{/snippet}
	</BookDetail>
{:else}
	<FillCenter><p class="muted">{t('Book not found.')}</p></FillCenter>
{/if}

<ConfirmDialog bind:this={confirmDialog} title={t('Delete book?')} />

<style>
	/* The same 8px as between the stacked actions. */
	.row {
		display: flex;
		gap: 8px;
	}
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
