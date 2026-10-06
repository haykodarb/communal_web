<script lang="ts">
	import Icon from './Icon.svelte';
	import type { AppNotification } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { profileHref } from '#lib/links.ts';

	// One notification row (NotificationWidgetFactory + its per-table widgets).
	let {
		notification,
		loading = false,
		onrespond
	}: {
		notification: AppNotification;
		loading?: boolean;
		/** Accept/reject a friend request. */
		onrespond: (accept: boolean) => void;
	} = $props();

	type Segment = { text: string; strong?: boolean };

	// Sentence fragments from NotificationType in the Flutter app.
	const loanStarts: Record<string, string> = {
		accepted: 'Your request for ',
		rejected: 'Your request for ',
		created: 'A request has been submitted for ',
		returned: 'Your loan for '
	};
	const loanEnds: Record<string, string> = {
		accepted: ' has been accepted by ',
		rejected: ' has been rejected by ',
		created: ' by ',
		returned: ' has been marked as returned by '
	};

	const { table, event } = $derived(notification.type);
	const sender = $derived(notification.sender?.username ?? '');

	const segments = $derived.by((): Segment[] => {
		switch (table) {
			case 'loans':
				return [
					{ text: t(loanStarts[event] ?? '') },
					{ text: notification.loan?.book.title ?? '', strong: true },
					{ text: t(loanEnds[event] ?? '') },
					{ text: sender, strong: true }
				];
			case 'books':
				return [
					{ text: notification.book?.title ?? '', strong: true },
					{ text: t(' is available again.') }
				];
			case 'friendships':
				return event === 'created'
					? [{ text: sender, strong: true }, { text: t(' sent you a friend request.') }]
					: [{ text: t('You became friends with ') }, { text: sender, strong: true }];
			// Notifications have no membership column, so (as in Flutter) these rows
			// carry no community name and nothing to act on.
			case 'memberships':
				return event === 'created'
					? [{ text: t('You have been invited to join ') }, { text: t(' by ') }, { text: sender, strong: true }]
					: [{ text: t('You have joined community ') }];
			default:
				return [{ text: `${t('Unknown notification type:')} ${table}` }];
		}
	});

	const icon = $derived(
		{ loans: 'users-arrows', friendships: 'user-plus', memberships: 'envelope', books: 'library' }[table] ?? 'bell'
	);

	const href = $derived.by(() => {
		if (table === 'loans' && notification.loan) return `/app/loans/${notification.loan.id}`;
		if (table === 'books' && notification.book) return `/app/book/${notification.book.id}`;
		if (table === 'friendships' && event === 'accepted' && notification.sender)
			return profileHref(notification.sender);
		return null;
	});

	const canRespond = $derived(
		event === 'created' && table === 'friendships' && notification.friendship !== null
	);
</script>

<div class="card" class:loading>
	<svelte:element this={href ? 'a' : 'div'} class="body" {href}>
		<span class="icon"><Icon name={icon} size={22} /></span>
		<p class="text">
			{#each segments as segment, i (i)}
				{#if segment.strong}<strong>{segment.text}</strong>{:else}{segment.text}{/if}
			{/each}
		</p>
	</svelte:element>
	{#if canRespond}
		<div class="actions">
			<button type="button" class="accept" disabled={loading} onclick={() => onrespond(true)}>
				{t('Accept')}
			</button>
			<button type="button" class="reject" disabled={loading} onclick={() => onrespond(false)}>
				{t('Reject')}
			</button>
		</div>
	{/if}
</div>

<style>
	.card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 15px;
		border-radius: 10px;
		background: var(--surface-container);
		transition: opacity 150ms ease;
	}
	.card.loading {
		opacity: 0.5;
	}
	.body {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 10px;
		color: inherit;
		text-decoration: none;
	}
	.icon {
		flex: 0 0 auto;
		display: flex;
		padding: 6px;
		border-radius: 50%;
		background: var(--surface);
		color: var(--secondary);
	}
	.text {
		font-size: 14px;
		line-height: 1.25;
		white-space: pre-line;
	}
	strong {
		color: var(--secondary);
		font-weight: 500;
	}
	.actions {
		display: flex;
		gap: 5px;
	}
	.actions button {
		width: 70px;
		height: 30px;
		border: none;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
	}
	.accept {
		background: var(--primary);
		color: var(--on-primary);
	}
	.reject {
		background: color-mix(in srgb, var(--primary) 15%, transparent);
		color: var(--primary);
	}
</style>
