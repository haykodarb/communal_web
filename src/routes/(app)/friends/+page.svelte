<script lang="ts">
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import Loading from '#lib/components/Loading.svelte';
	import PillButton from '#lib/components/PillButton.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import TabBar from '#lib/components/TabBar.svelte';
	import UserRow from '#lib/components/UserRow.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import {
		acceptFriendRequest,
		deleteFriendship,
		getFriendships,
		type FriendshipList
	} from '#lib/data/api.ts';
	import type { Friendship } from '#lib/data/models.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';
	import { onTableChange } from '#lib/realtime.ts';
	import { unread } from '#lib/unread.svelte.ts';

	// Friends / Received / Sent tabs over the friendships table.
	const PAGE_SIZE = 30;
	const LISTS: FriendshipList[] = ['friends', 'received', 'sent'];

	const userId = $derived(auth.user!.id);

	let tab = $state(0);
	let busyId = $state<number | null>(null);
	let error = $state('');
	let confirmDialog: ConfirmDialog;
	let confirmTitle = $state('');

	const lists = LISTS.map((list) =>
		createPaged<Friendship>(
			(page) => getFriendships(userId, list, { page, pageSize: PAGE_SIZE }),
			PAGE_SIZE
		)
	);
	const current = $derived(lists[tab]);

	const other = (f: Friendship) => (f.requester.id === userId ? f.responder : f.requester);

	// New or withdrawn requests arrive as notification changes (friendships
	// aren't in the realtime publication).
	$effect(() =>
		onTableChange('notifications', (change) => {
			const row = change.event === 'DELETE' ? change.oldRow : change.newRow;
			if (change.event !== 'DELETE' && !row.friendship) return;
			lists[tab].reset();
		})
	);

	async function run(friendship: Friendship, title: string, action: () => Promise<void>) {
		confirmTitle = title;
		if (!(await confirmDialog.confirm())) return;
		busyId = friendship.id;
		error = '';
		try {
			await action();
			current.items = current.items.filter((f) => f.id !== friendship.id);
			unread.refreshFriendRequests(userId);
		} catch (e) {
			error = errorMessage(e);
		}
		busyId = null;
	}

	const accept = (f: Friendship) =>
		run(f, t('Accept this request?'), async () => {
			await acceptFriendRequest(f.id);
			lists[0].reset();
		});
	// Rejecting deletes the request so it can be sent again later.
	const reject = (f: Friendship) =>
		run(f, t('Reject this request?'), () => deleteFriendship(f.id));
	const withdraw = (f: Friendship) =>
		run(f, t('Withdraw friend request?'), () => deleteFriendship(f.id));
	const remove = (f: Friendship) =>
		run(f, t('Remove {name} as friend?').replace('{name}', other(f).username), () =>
			deleteFriendship(f.id)
		);

	const empty = [
		'You have no friends yet. Find people in Search.',
		'No pending requests.',
		'You have not sent any requests.'
	];
</script>

<div class="page">
	<div class="controls">
		<TabBar
			tabs={[t('Friends'), t('Received'), t('Sent')]}
			index={tab}
			onchange={(i) => {
				tab = i;
				lists[i].reset();
			}}
		/>
	</div>

	{#if error}
		<p class="error-text">{error}</p>
	{/if}

	{#if current.items.length > 0}
		<div class="list">
			{#each current.items as friendship (friendship.id)}
				<UserRow profile={other(friendship)}>
					{#snippet actions()}
						{#if tab === 0}
							<PillButton
								icon="user-minus"
								label={t('Remove')}
								loading={busyId === friendship.id}
								onclick={() => remove(friendship)}
							/>
						{:else if tab === 1}
							<PillButton
								icon="check"
								label={t('Accept')}
								filled
								loading={busyId === friendship.id}
								onclick={() => accept(friendship)}
							/>
							<PillButton
								icon="x"
								label={t('Reject')}
								loading={busyId === friendship.id}
								onclick={() => reject(friendship)}
							/>
						{:else}
							<PillButton
								icon="x"
								label={t('Withdraw')}
								loading={busyId === friendship.id}
								onclick={() => withdraw(friendship)}
							/>
						{/if}
					{/snippet}
				</UserRow>
			{/each}
		</div>
	{:else if current.error}
		<p class="error-text">{current.error}</p>
	{:else if !current.loading && !current.hasMore}
		<p class="muted">{t(empty[tab])}</p>
	{/if}

	{#if current.loading}
		<Loading fill={current.items.length === 0} />
	{/if}
	{#key tab}
		<Sentinel onvisible={current.loadMore} />
	{/key}
</div>

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	.page {
		min-height: 100vh;
		padding-bottom: 40px;
	}
	/* FriendshipsPage: tab bar and list both inset 10px, 5px apart. */
	.controls {
		padding: 0 10px 5px;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 5px;
		padding: 0 10px 20px;
	}
	.muted {
		padding: 20px;
		text-align: center;
		color: var(--on-surface-variant);
	}
	.error-text {
		padding: 0 20px;
		text-align: center;
		font-size: 14px;
		color: var(--error);
	}
	/* Flutter adds a 20px spacer above the tabs on desktop. */
	@media (min-width: 800px) {
		.page {
			padding-top: 20px;
		}
	}
</style>
