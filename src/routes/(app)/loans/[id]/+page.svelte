<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Avatar from '#lib/components/Avatar.svelte';
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
	import { formatShortDate } from '#lib/format.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';

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

	/** Asks for confirmation, runs the action, then reloads the loan. */
	async function act(title: string, action: () => Promise<void>, leave = false) {
		confirmTitle = t(title);
		if (!(await confirmDialog.confirm())) return;
		busy = true;
		error = '';
		try {
			await action();
			if (leave) {
				await goto('/loans', { replace: true });
				return;
			}
			await load();
		} catch (e) {
			error = errorMessage(e);
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
			error = errorMessage(e);
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
				<a href={`/profile/${loan.loanee.id}`}><Avatar profile={loan.loanee} size={50} /></a>
				<a href={`/profile/${loan.loanee.id}`}>{loan.loanee.username}</a>
				{t('requested this book')}
			{:else}
				{t('You requested this book from')}
				<a href={`/profile/${loan.owner.id}`}>{loan.owner.username}</a>
			{/if}
		</p>

		<!-- Flutter _bookCard: title/author left, small cover right. -->
		<a class="book" href={isOwned ? `/my-books/${loan.book.id}` : `/book/${loan.book.id}`}>
			<div class="info">
				<h1>{loan.book.title}</h1>
				<p class="author">{loan.book.author}</p>
			</div>
			<div class="cover">
				<CoverImage bucket="book_covers" path={loan.book.image_path} alt={loan.book.title} />
			</div>
		</a>

		<h2>{t('Request status')}</h2>
		{#if loan.rejected}
			<p class="muted">{t('Loan rejected')}</p>
		{:else}
			{@const steps = [
				{ label: t('Requested'), date: loan.created_at, active: true },
				{ label: t('Accepted'), date: loan.accepted_at, active: loan.accepted },
				{ label: t('Returned'), date: loan.returned_at, active: loan.returned }
			]}
			<ol class="timeline" style:--progress={loan.returned ? 1 : loan.accepted ? 0.5 : 0}>
				{#each steps as step (step.label)}
					<li class:active={step.active}>
						<span class="date">{step.active ? formatShortDate(step.date ?? loan.created_at) : ''}</span>
						<span class="dot"></span>
						<span class="label">{step.label}</span>
					</li>
				{/each}
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
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 8px;
		font-size: 14px;
	}
	.who a {
		display: flex;
		color: var(--secondary);
		font-weight: 600;
		text-decoration: none;
	}
	.book {
		margin-top: 8px;
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 20px;
		border-radius: 12px;
		background: var(--surface-container);
		color: inherit;
		text-decoration: none;
	}
	.cover {
		flex: 0 0 auto;
		height: 60px;
		aspect-ratio: 3 / 4;
		border-radius: 3px;
		overflow: hidden;
	}
	.info {
		flex: 1;
		min-width: 0;
	}
	h1 {
		font-size: 14px;
		font-weight: 600;
		line-height: 1.2;
	}
	h2 {
		margin: 28px 0 10px;
		font-size: 16px;
		font-weight: 700;
	}
	.author {
		margin-top: 10px;
		font-size: 12px;
		line-height: 1.2;
		color: var(--on-surface-variant);
	}
	/* Flutter _datesCard: date above a ringed dot, uppercase label below. */
	.timeline {
		position: relative;
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		justify-content: space-between;
	}
	.timeline::before,
	.timeline::after {
		content: '';
		position: absolute;
		top: 38px;
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
		background: var(--tertiary-container);
	}
	.timeline li {
		position: relative;
		z-index: 1;
		width: 80px;
		height: 80px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		color: var(--tertiary-container);
	}
	.timeline li.active {
		color: var(--on-surface);
	}
	.date {
		min-height: 14px;
		font-size: 10px;
		color: var(--on-surface-variant);
	}
	.dot {
		width: 20px;
		height: 20px;
		margin: 5px;
		border-radius: 50%;
		background: currentColor;
		position: relative;
	}
	.dot::after {
		content: '';
		position: absolute;
		inset: 5px;
		border-radius: 50%;
		background: var(--surface);
	}
	.label {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
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
