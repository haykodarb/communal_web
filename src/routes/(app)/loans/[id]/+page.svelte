<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import CoverImage from '#lib/components/CoverImage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { getLoanById } from '#lib/data/api.ts';
	import type { Loan } from '#lib/data/models.ts';
	import { auth } from '#lib/auth.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let loan = $state<Loan | null>(null);
	let loading = $state(true);

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		loading = true;
		getLoanById(id)
			.then((result) => {
				loan = result;
			})
			.finally(() => {
				loading = false;
			});
	});

	const isBorrowed = $derived(loan ? loan.loanee.id === auth.user?.id : false);
</script>

<div class="detail">
	<button class="back" type="button" aria-label={t('Back')} onclick={() => goto('/loans')}>
		<Icon name="chevron-left" size={32} />
	</button>

	{#if loading}
		<p class="muted">{t('Loading…')}</p>
	{:else if loan}
		<div class="row">
			<div class="cover">
				<CoverImage bucket="book_covers" path={loan.book.image_path} alt={loan.book.title} />
			</div>
			<div class="info">
				<h1>{loan.book.title}</h1>
				<p class="author">{loan.book.author}</p>
				<p class="who">
					{isBorrowed ? t('Borrowed from') : t('Loaned to')}
					{isBorrowed ? loan.owner.username : loan.loanee.username}
				</p>
				<p class="state">
					{loan.returned
						? t('Loan completed')
						: loan.accepted
							? t('Loan accepted')
							: loan.rejected
								? t('Loan rejected')
								: t('Awaiting approval')}
				</p>
			</div>
		</div>
	{:else}
		<p class="muted">{t('Loan not found.')}</p>
	{/if}
</div>

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
	.row {
		display: flex;
		gap: 20px;
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
	.author {
		margin-top: 4px;
		font-size: 13px;
		color: var(--on-surface-variant);
	}
	.who {
		margin-top: 14px;
		font-size: 13px;
	}
	.state {
		margin-top: 6px;
		font-size: 12px;
		color: var(--on-surface-variant);
	}
	.muted {
		color: var(--on-surface-variant);
	}
</style>
