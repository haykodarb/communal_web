<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Button from '#lib/components/Button.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import CoverImage from '#lib/components/CoverImage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import {
		deleteLoan,
		getLoanById,
		setLoanFlag,
		updateLoanReview
	} from '#lib/data/api.ts';
	import type { Loan } from '#lib/data/models.ts';
	import { auth } from '#lib/auth.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let loan = $state<Loan | null>(null);
	let loading = $state(true);
	let busy = $state(false);
	let error = $state('');

	let editingReview = $state(false);
	let reviewDraft = $state('');

	let confirmDialog: ConfirmDialog;
	let confirmTitle = $state('');

	const id = $derived(page.params.id!);

	async function load() {
		loan = await getLoanById(id);
	}

	$effect(() => {
		loading = true;
		getLoanById(id)
			.then((result) => (loan = result))
			.finally(() => (loading = false));
	});

	const isOwned = $derived(loan ? loan.owner.id === auth.user?.id : false);

	const formatDate = (date?: string | null) =>
		date
			? new Intl.DateTimeFormat('en-GB', {
					day: '2-digit',
					month: '2-digit',
					year: '2-digit'
				}).format(new Date(date))
			: '';

	/** Asks for confirmation, runs the action, then reloads the loan. */
	async function act(title: string, action: () => Promise<void>, leave = false) {
		confirmTitle = t(title);
		if (!(await confirmDialog.confirm())) return;
		busy = true;
		error = '';
		try {
			await action();
			if (leave) {
				await goto('/loans', { replaceState: true });
				return;
			}
			await load();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
		busy = false;
	}

	async function saveReview() {
		busy = true;
		error = '';
		try {
			await updateLoanReview(id, reviewDraft.trim() || null);
			await load();
			editingReview = false;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
		busy = false;
	}

	function startEditing() {
		reviewDraft = loan?.review ?? '';
		editingReview = true;
	}
</script>

<div class="detail">
	<button class="back" type="button" aria-label={t('Back')} onclick={() => goto('/loans')}>
		<Icon name="chevron-left" size={32} />
	</button>

	{#if loading}
		<p class="muted">{t('Loading…')}</p>
	{:else if loan}
		<p class="who">
			{#if isOwned}
				<a href={`/profile/${loan.loanee.id}`}>{loan.loanee.username}</a>
				{t('requested this book')}
			{:else}
				{t('You requested this book from')}
				<a href={`/profile/${loan.owner.id}`}>{loan.owner.username}</a>
			{/if}
		</p>

		<a class="book" href={isOwned ? `/my-books/${loan.book.id}` : `/book/${loan.book.id}`}>
			<div class="cover">
				<CoverImage bucket="book_covers" path={loan.book.image_path} alt={loan.book.title} />
			</div>
			<div class="info">
				<h1>{loan.book.title}</h1>
				<p class="author">{loan.book.author}</p>
			</div>
		</a>

		<h2>{t('Request status')}</h2>
		{#if loan.rejected}
			<p class="muted">{t('Loan rejected')}</p>
		{:else}
			<ol class="timeline" style:--progress={loan.returned ? 1 : loan.accepted ? 0.5 : 0}>
				<li class="active">
					<span class="dot"></span>
					<span class="label">{t('Requested')}</span>
					<span class="date">{formatDate(loan.created_at)}</span>
				</li>
				<li class:active={loan.accepted}>
					<span class="dot"></span>
					<span class="label">{t('Accepted')}</span>
					<span class="date">{formatDate(loan.accepted_at)}</span>
				</li>
				<li class:active={loan.returned}>
					<span class="dot"></span>
					<span class="label">{t('Returned')}</span>
					<span class="date">{formatDate(loan.returned_at)}</span>
				</li>
			</ol>
		{/if}

		<div class="actions">
			{#if loan.rejected}
				<!-- Nothing left to do on a rejected loan. -->
			{:else if isOwned}
				{#if loan.accepted || loan.returned}
					{#if loan.review}
						<div class="review">
							<span class="review-title">{t('Review by')} {loan.loanee.username}</span>
							<p>{loan.review}</p>
						</div>
					{/if}
					{#if !loan.returned}
						<Button
							loading={busy}
							onclick={() => act('Mark this book as returned?', () => setLoanFlag(id, 'returned'))}
						>
							{t('Mark as returned')}
						</Button>
					{/if}
				{:else}
					<div class="row">
						<Button
							loading={busy}
							onclick={() => act('Accept this loan?', () => setLoanFlag(id, 'accepted'))}
						>
							{t('Approve')}
						</Button>
						<Button
							variant="tonal"
							disabled={busy}
							onclick={() => act('Reject this loan?', () => setLoanFlag(id, 'rejected'), true)}
						>
							{t('Reject')}
						</Button>
					</div>
				{/if}
			{:else if loan.accepted || loan.returned}
				{#if editingReview}
					<TextField label={t('Write a review...')} bind:value={reviewDraft} rows={5} />
					<div class="row">
						<Button loading={busy} onclick={saveReview}>{t('Submit')}</Button>
						<Button variant="tonal" disabled={busy} onclick={() => (editingReview = false)}>
							{t('Cancel')}
						</Button>
					</div>
				{:else if loan.review}
					<div class="review">
						<span class="review-title">{t('Your review')}</span>
						<p>{loan.review}</p>
					</div>
					<Button variant="tonal" onclick={startEditing}>{t('Edit review')}</Button>
				{:else}
					<Button onclick={startEditing}>{t('Add review')}</Button>
				{/if}
			{:else}
				<Button
					variant="tonal"
					loading={busy}
					onclick={() => act('Withdraw your request for this book?', () => deleteLoan(id), true)}
				>
					{t('Withdraw request')}
				</Button>
			{/if}

			{#if error}
				<p class="error-text">{error}</p>
			{/if}
		</div>
	{:else}
		<p class="muted">{t('Loan not found.')}</p>
	{/if}
</div>

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	.detail {
		padding: 16px 20px 40px;
	}
	.back {
		background: none;
		border: none;
		color: var(--on-surface);
		cursor: pointer;
		padding: 0;
		margin-bottom: 12px;
	}
	.who {
		font-size: 14px;
		margin-bottom: 16px;
	}
	.who a {
		color: var(--secondary);
		font-weight: 600;
		text-decoration: none;
	}
	.book {
		display: flex;
		gap: 20px;
		color: inherit;
		text-decoration: none;
	}
	.cover {
		width: 120px;
		flex: 0 0 120px;
		aspect-ratio: 3 / 4;
		border-radius: 5px;
		overflow: hidden;
	}
	.info {
		flex: 1;
		min-width: 0;
	}
	h1 {
		font-size: 18px;
		font-weight: 700;
		line-height: 1.25;
	}
	h2 {
		margin: 28px 0 20px;
		font-size: 16px;
		font-weight: 700;
	}
	.author {
		margin-top: 4px;
		font-size: 13px;
		color: var(--on-surface-variant);
	}
	.timeline {
		position: relative;
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		justify-content: space-between;
	}
	/* Track between the first and last dot: done part, then remaining part. */
	.timeline::before,
	.timeline::after {
		content: '';
		position: absolute;
		top: 8px;
		height: 4px;
		transition: all 500ms ease;
	}
	.timeline::before {
		left: 40px;
		width: calc((100% - 80px) * var(--progress));
		background: var(--on-surface);
	}
	.timeline::after {
		right: 40px;
		width: calc((100% - 80px) * (1 - var(--progress)));
		background: var(--tertiary-container, var(--surface-container));
	}
	.timeline li {
		position: relative;
		z-index: 1;
		width: 80px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		color: var(--on-surface-variant);
		font-size: 12px;
	}
	.timeline li.active {
		color: var(--on-surface);
	}
	.dot {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--surface-container);
		border: 3px solid var(--surface);
	}
	.active .dot {
		background: var(--primary);
	}
	.label {
		font-weight: 600;
	}
	.actions {
		margin-top: 28px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.row {
		display: flex;
		gap: 20px;
	}
	.review {
		padding: 16px;
		border-radius: 10px;
		background: var(--surface-container);
	}
	.review-title {
		font-size: 13px;
		font-weight: 700;
	}
	.review p {
		margin-top: 8px;
		font-size: 15px;
		line-height: 1.5;
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
