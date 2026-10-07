<script lang="ts">
	import type { Loan } from '#lib/data/models.ts';
	import { auth } from '#lib/auth.svelte.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import CoverImage from './CoverImage.svelte';

	let { loan }: { loan: Loan } = $props();

	const isBorrowed = $derived(loan.loanee.id === auth.user?.id);
	const otherName = $derived(isBorrowed ? loan.owner.username : loan.loanee.username);
	const roleLabel = $derived(isBorrowed ? t('Owner') : t('Loanee'));

	const statusText = $derived(
		loan.returned
			? t('Loan completed')
			: loan.accepted
				? t('On loan')
				: loan.rejected
					? t('Loan rejected')
					: t('Awaiting approval')
	);

	const dateText = $derived(
		`${
			loan.returned
				? t('Returned')
				: loan.accepted
					? t('Approved')
					: loan.rejected
						? t('Rejected')
						: t('Requested')
		} ${formatDate(loan.latest_date ?? loan.created_at)}`
	);

	function formatDate(iso: string): string {
		const date = new Date(iso);
		return new Intl.DateTimeFormat(i18n.locale === 'es' ? 'es-ES' : 'en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		}).format(date);
	}
</script>

<a class="card pressable" href={`/loans/${loan.id}`}>
	<div class="body">
		<span class="title">{loan.book.title}</span>
		<span class="author">{loan.book.author}</span>
		<span class="spacer"></span>
		<div class="who">
			<span class="name">{otherName}</span>
			<span class="role" class:owner={isBorrowed}>{roleLabel}</span>
		</div>
		<span class="status-text">{statusText}</span>
		<span class="date">{dateText}</span>
	</div>
	<div class="cover">
		<CoverImage bucket="book_covers" path={loan.book.image_path} alt={loan.book.title} />
	</div>
</a>

<style>
	.card {
		--padding: 20px;
		--radius: 10px;
		display: flex;
		align-items: center;
		padding: var(--padding);
		border-radius: var(--radius);
		background: var(--surface-container);
		text-decoration: none;
		color: inherit;
	}
	.body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.title {
		font-size: 14px;
		font-weight: 600;
		line-height: 1.2;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.author {
		margin-top: 5px;
		font-size: 12px;
		color: var(--on-surface-variant);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.spacer {
		height: 20px;
	}
	.who {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.who .name {
		font-size: 12px;
		font-weight: 500;
	}
	.role {
		font-size: 12px;
		padding: 2px 10px;
		border-radius: 40px;
		background: color-mix(in srgb, var(--primary) 25%, transparent);
	}
	.role.owner {
		background: color-mix(in srgb, var(--tertiary) 25%, transparent);
	}
	.status-text {
		margin-top: 5px;
		font-size: 12px;
		color: var(--on-surface-variant);
	}
	.date {
		margin-top: 5px;
		font-size: 12px;
		color: var(--on-surface-variant);
	}
	/* Concentric with the card (its radius minus its padding), 5px at least. */
	.cover {
		width: 96px;
		height: 128px;
		flex: 0 0 96px;
		margin-left: 10px;
		border-radius: max(5px, var(--radius) - var(--padding));
		overflow: hidden;
	}
</style>
