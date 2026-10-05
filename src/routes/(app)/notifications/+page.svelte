<script lang="ts">
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import NotificationCard from '#lib/components/NotificationCard.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import {
		getNotificationById,
		getNotifications,
		respondToFriendRequest,
		respondToInvitation,
		setNotificationsRead
	} from '#lib/data/api.ts';
	import type { AppNotification } from '#lib/data/models.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { onTableChange } from '#lib/realtime.ts';
	import { unread } from '#lib/unread.svelte.ts';

	const PAGE_SIZE = 20;

	let notifications = $state<AppNotification[]>([]);
	let page = $state(0);
	let hasMore = $state(true);
	let loading = $state(false);
	let error = $state('');
	let busyId = $state<number | null>(null);

	let confirmDialog: ConfirmDialog;
	let confirmTitle = $state('');
	let sentinel = $state<HTMLElement>();

	const userId = $derived(auth.user!.id);

	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;
		try {
			const next = await getNotifications(userId, { page, pageSize: PAGE_SIZE });
			notifications = [...notifications, ...next];
			hasMore = next.length === PAGE_SIZE;
			page += 1;
			// Rows keep their `seen` flag locally so the "New" header still shows.
			if (next.some((n) => !n.seen)) {
				setNotificationsRead(userId).then(() => unread.refreshNotifications(userId));
			}
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			hasMore = false;
		}
		loading = false;
	}

	// Live updates, as in NotificationsController.realtimeListener.
	$effect(() =>
		onTableChange('notifications', async (change) => {
			if (change.event === 'DELETE') {
				notifications = notifications.filter((n) => n.id !== change.oldRow.id);
				return;
			}
			if (change.newRow.receiver !== userId) return;
			const fresh = await getNotificationById(change.newRow.id as number);
			if (!fresh) return;
			const index = notifications.findIndex((n) => n.id === fresh.id);
			if (index >= 0) notifications[index] = fresh;
			else notifications = [fresh, ...notifications];
		})
	);

	$effect(() => {
		if (!sentinel) return;
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) loadMore();
		});
		observer.observe(sentinel);
		return () => observer.disconnect();
	});

	const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

	/** Group header shown above a row, as in NotificationWidgetFactory. */
	function headerFor(index: number): string | null {
		const current = notifications[index];
		const previous = index > 0 ? notifications[index - 1] : null;
		if (!current.seen) return !previous || previous.seen ? t('New') : null;

		const date = new Date(current.updated_at);
		if (previous && previous.seen && sameDay(date, new Date(previous.updated_at))) return null;

		const today = new Date();
		if (sameDay(date, today)) return t('Today');
		return new Intl.DateTimeFormat(i18n.locale === 'es' ? 'es-ES' : 'en-GB', {
			day: '2-digit',
			month: 'short',
			year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
		}).format(date);
	}

	async function respond(notification: AppNotification, accept: boolean) {
		confirmTitle = t(accept ? 'Accept this request?' : 'Reject this request?');
		if (!(await confirmDialog.confirm())) return;

		busyId = notification.id;
		error = '';
		try {
			if (notification.type.table === 'friendships') {
				await respondToFriendRequest(notification.friendship!.id, accept);
			} else {
				await respondToInvitation(notification.membership!.id, accept);
			}
			if (accept) {
				notification.type = { ...notification.type, event: 'accepted' };
			} else {
				notifications = notifications.filter((n) => n.id !== notification.id);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
		busyId = null;
	}
</script>

<div class="container">
	<h1>{t('Notifications')}</h1>

	{#if error}
		<p class="error-text">{error}</p>
	{/if}

	{#if notifications.length === 0 && !loading && !hasMore}
		<div class="empty">
			<Icon name="bell" size={40} />
			<p>{t('No notifications yet.')}</p>
		</div>
	{:else}
		<div class="list">
			{#each notifications as notification, i (notification.id)}
				{@const header = headerFor(i)}
				{#if header}
					<span class="header">{header}</span>
				{/if}
				<NotificationCard
					{notification}
					loading={busyId === notification.id}
					onrespond={(accept) => respond(notification, accept)}
				/>
			{/each}
		</div>
	{/if}

	{#if loading}
		<p class="muted">{t('Loading…')}</p>
	{/if}
	<div bind:this={sentinel} class="sentinel"></div>
</div>

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	h1 {
		font-size: 32px;
		font-weight: 800;
		margin-bottom: 20px;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.header {
		margin-top: 8px;
		font-size: 14px;
		color: var(--on-surface-variant);
	}
	.empty {
		margin-top: 50px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		color: var(--on-surface-variant);
	}
	.sentinel {
		height: 1px;
	}
	.error-text {
		margin-bottom: 12px;
		text-align: center;
		font-size: 14px;
		color: var(--error);
	}
	.muted {
		margin-top: 12px;
		text-align: center;
		color: var(--on-surface-variant);
	}
</style>
