<script lang="ts">
	import { goto } from '$app/navigation';
	import BookDetail from '#lib/components/BookDetail.svelte';
	import Button from '#lib/components/Button.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import { deleteBook } from '#lib/data/api.ts';
	import type { Book, Loan } from '#lib/data/models.ts';
	import { formatShortDate } from '#lib/format.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';
	import type { PageProps } from './$types';

	// BookOwnedPage. It comes from the load (through the page cache).
	let { data }: PageProps = $props();
	const book = $derived<Book | null>(data.details.book);
	const currentLoan = $derived<Loan | null>(data.details.currentLoan);
	const reviews = $derived<Loan[]>(data.details.reviews);
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
		} catch (e) {
			error = errorMessage(e);
			deleting = false;
		}
	}
</script>

{#if book}
	<BookDetail
		{book}
		{reviews}
		onback={() => goto('/my-books')}
		info={[
			{ label: t('Added'), value: formatShortDate(book.created_at) },
			{ label: t('Visibility'), value: book.public ? t('Public') : t('Private') },
			{ label: t('Status'), value: book.loaned ? t('Loaned') : t('Available') }
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
	<p class="muted">{t('Book not found.')}</p>
{/if}

<ConfirmDialog bind:this={confirmDialog} title={t('Delete book?')} />

<style>
	.row {
		display: flex;
		gap: 20px;
	}
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
