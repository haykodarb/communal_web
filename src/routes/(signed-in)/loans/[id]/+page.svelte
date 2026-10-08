<script lang="ts">
	import FillCenter from '#lib/components/FillCenter.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Button from '#lib/components/Button.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import BackButton from '#lib/components/BackButton.svelte';
	import CoverImage from '#lib/components/CoverImage.svelte';
	import PillButton from '#lib/components/PillButton.svelte';
	import ReviewItem from '#lib/components/ReviewItem.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import UserLink from '#lib/components/UserLink.svelte';
	import {
		deleteLoan,
		getLoanById,
		setLoanFlag,
		updateLoanReview
	} from '#lib/data/api.ts';
	import type { Loan } from '#lib/data/models.ts';
	import { formatMediumDate } from '#lib/format.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { profileHref } from '#lib/links.ts';
	import { toast } from '#lib/toast.svelte.ts';
	import type { PageProps } from './$types';

	// The loan comes from the load (through the page cache).
	let { data }: PageProps = $props();
	let loan = $derived<Loan | null>(data.loan);
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

	const isOwned = $derived(loan ? loan.owner.id === data.userId : false);

	/** Asks for confirmation, runs the action, then reloads the loan. */
	async function act(
		title: string,
		action: () => Promise<void>,
		leave = false,
		doneMessage?: string
	) {
		confirmTitle = t(title);
		if (!(await confirmDialog.confirm())) return;
		busy = true;
		error = '';
		try {
			await action();
			if (doneMessage) toast.show(t(doneMessage));
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

	// The timeline line starts empty and fills to the loan's step once the page
	// is on screen (its width transition does the animating).
	let timelineShown = $state(false);
	onMount(() => {
		requestAnimationFrame(() => requestAnimationFrame(() => (timelineShown = true)));
	});

	const pageTitle = $derived(`${loan?.book.title ?? t('Loans')} · Communal`);
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="detail">
	<div class="menu"><BackButton /></div>

	{#if loan}
		<!-- The other person, like a contact: avatar, name, and their role. -->
		{@const person = isOwned ? loan.loanee : loan.owner}
		{@const role = isOwned
			? loan.returned
				? 'Borrowed this book'
				: loan.accepted
					? 'Is borrowing this book'
					: loan.rejected
						? 'Asked to borrow this book'
						: 'Wants to borrow this book'
			: loan.returned
				? 'Owner · you borrowed this book'
				: loan.accepted
					? "Owner · you're borrowing this book"
					: 'Owner · you asked to borrow this book'}
		<!-- A rejected request reads like an accepted one, except the middle step
		     says Rejected, in red with a red ring. -->
		{@const steps = [
			{ label: t('Requested'), date: loan.created_at, active: true },
			loan.rejected
				? { label: t('Rejected'), date: loan.rejected_at, active: true, rejected: true }
				: { label: t('Accepted'), date: loan.accepted_at, active: loan.accepted },
			{ label: t('Returned'), date: loan.returned_at, active: loan.returned }
		]}
		<div class="who">
			<a class="who-avatar" href={profileHref(person)} tabindex="-1" aria-hidden="true">
				<Avatar profile={person} size={44} />
			</a>
			<div class="who-text">
				<span class="who-name"><UserLink profile={person} avatar={false} /></span>
				<span class="who-role">
					{t(role)}
				</span>
			</div>
			<!-- Message the other person to arrange the handover. -->
			<span class="message">
				<PillButton
					icon="comment-dots-bold"
					label={t('Message')}
					onclick={() => goto(`/messages/${person.id}`)}
				/>
			</span>
		</div>

		<!-- One card for the loan's story: the book, the timeline and, once there
		     is one, the review. The actions stay below it. -->
		<div class="loan-card">
			<a class="book pressable" href={isOwned ? `/my-books/${loan.book.id}` : `/book/${loan.book.id}`}>
				<div class="info">
					<h1>{loan.book.title}</h1>
					<p class="author">{loan.book.author}</p>
				</div>
				<div class="cover">
					<CoverImage bucket="book_covers" path={loan.book.image_path} alt={loan.book.title} />
				</div>
			</a>

			<hr class="divider" />

			<ol
				class="timeline"
				style:--progress={timelineShown
					? loan.returned
						? 1
						: loan.accepted || loan.rejected
							? 0.5
							: 0
					: 0}
			>
				{#each steps as step (step.label)}
					<li class:active={step.active} class:rejected={'rejected' in step}>
						<span class="date">
							{step.active ? formatMediumDate(step.date ?? loan.created_at, i18n.locale) : ''}
						</span>
						<span class="dot"></span>
						<span class="label">{step.label}</span>
					</li>
				{/each}
			</ol>

			{#if loan.review && (loan.accepted || loan.returned) && !editingReview}
				<hr class="divider" />
				<ReviewItem
					author={loan.loanee}
					text={loan.review}
					tag={isOwned ? t('Review') : t('Your review')}
					showAuthor={false}
				/>
			{/if}
		</div>

		<div class="actions">
			{#if loan.rejected}
				<!-- Nothing left to do on a rejected loan. -->
			{:else if isOwned}
				{#if loan.accepted || loan.returned}
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
							onclick={() =>
								act('Accept this loan?', () => setLoanFlag(id, 'accepted'), false, 'Loan approved')}
						>
							{t('Approve')}
						</Button>
						<Button
							variant="tonal"
							disabled={busy}
							onclick={() =>
								act('Reject this loan?', () => setLoanFlag(id, 'rejected'), true, 'Loan rejected')}
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
		<FillCenter><p class="muted">{t('Loan not found.')}</p></FillCenter>
	{/if}
</div>

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	.detail {
		padding: 16px 20px 40px;
	}
	.menu {
		margin: -8px 0 4px -8px;
	}
	.who {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 4px;
	}
	.who-avatar {
		display: flex;
		flex: 0 0 auto;
	}
	.who-text {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.who-name {
		font-size: 15px;
	}
	.who-role {
		font-size: 12px;
		color: var(--on-surface-variant);
	}
	.message {
		margin-left: auto;
	}
	.loan-card {
		margin-top: 8px;
		padding: 12px 20px 20px;
		border-radius: 12px;
		background: var(--surface-container);
	}
	/* The book row links to the book; its hover tint reaches a little past the
	   text (negative margin) so it doesn't hug it. */
	.book {
		display: flex;
		align-items: center;
		gap: 15px;
		margin: 0 -10px;
		padding: 8px 10px;
		border-radius: 8px;
		color: inherit;
		text-decoration: none;
	}
	.divider {
		margin: 14px 0;
		border: none;
		border-top: 1px solid color-mix(in srgb, var(--on-surface) 8%, transparent);
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
	/* The Rejected step: the same ring and label, in red. */
	.timeline li.rejected .dot,
	.timeline li.rejected .label {
		color: var(--error);
	}
	.timeline li.rejected .dot {
		background: var(--error);
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
		/* The card's colour, so the dot reads as a ring. */
		background: var(--surface-container);
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
	.error-text {
		text-align: center;
		font-size: 14px;
		color: var(--error);
	}
	.muted {
		color: var(--on-surface-variant);
	}
</style>
