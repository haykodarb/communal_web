<script lang="ts">
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import Loading from '#lib/components/Loading.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import NotificationCard from '#lib/components/NotificationCard.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import {
		acceptFriendRequest,
		deleteFriendship,
		getNotificationById,
		getNotifications,
		setNotificationsRead
	} from '#lib/data/api.ts';
	import type { AppNotification } from '#lib/data/models.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { onTableChange } from '#lib/realtime.ts';
	import { unread } from '#lib/unread.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';

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
			error = errorMessage(e);
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
			if (accept) {
				await acceptFriendRequest(notification.friendship!.id);
				notification.type = { ...notification.type, event: 'accepted' };
			} else {
				// Rejecting deletes the request (its notification cascades), so the
				// sender can ask again later.
				await deleteFriendship(notification.friendship!.id);
				notifications = notifications.filter((n) => n.id !== notification.id);
			}
		} catch (e) {
			error = errorMessage(e);
		}
		busyId = null;
	}
</script>

<!-- CommonListView: 10px padding, 5px separators; the title is only in the mobile app bar. -->
<div class="page">
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
		<Loading fill={notifications.length === 0} />
	{/if}
	<div bind:this={sentinel} class="sentinel"></div>
</div>

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	.page {
		padding: 10px;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.header {
		margin-top: 5px;
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
</style>
