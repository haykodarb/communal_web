<script lang="ts">
	import { page } from '$app/state';
	import FillCenter from '#lib/components/FillCenter.svelte';
	import { untrack } from 'svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import Loading from '#lib/components/Loading.svelte';
	import PillButton from '#lib/components/PillButton.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import TabBar from '#lib/components/TabBar.svelte';
	import UserRow from '#lib/components/UserRow.svelte';
	import {
		acceptFriendRequest,
		deleteFriendship,
		getFriendships,
		type FriendshipList
	} from '#lib/data/api.ts';
	import type { Friendship } from '#lib/data/models.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { store } from '#lib/cache.ts';
	import { FRIEND_TABS, keys, PAGE_SIZE } from '#lib/data/pages.ts';
	import { selectTab, tabFrom } from '#lib/tabs.ts';
	import { createPaged } from '#lib/paged.svelte.ts';
	import type { PageProps } from './$types';
	import { onTableChange } from '#lib/realtime.ts';
	import { unread } from '#lib/unread.svelte.ts';

	// Friends / Requests tabs over the friendships table. The tab is in the URL
	// (?tab=), and the load fetches that tab's list (through the page cache).
	let { data }: PageProps = $props();

	const userId = $derived(data.userId);

	// The selected tab is local state so it switches right away; the URL (and its
	// load) follows. It re-syncs if the URL changes externally.
	let tab = $state<number>(FRIEND_TABS.indexOf(tabFrom(page.url, FRIEND_TABS)));
	$effect(() => {
		tab = FRIEND_TABS.indexOf(tabFrom(page.url, FRIEND_TABS));
	});
	function select(i: number) {
		tab = i;
		selectTab(FRIEND_TABS[i], FRIEND_TABS);
	}
	let busyId = $state<number | null>(null);
	let error = $state('');
	let confirmDialog: ConfirmDialog;
	let confirmTitle = $state('');

	const lists = FRIEND_TABS.map((list: FriendshipList) =>
		createPaged<Friendship>(
			(page) => getFriendships(userId, list, { page, pageSize: PAGE_SIZE.friends }),
			PAGE_SIZE.friends,
			{
				seed: untrack(() => (data.list === list ? data.state : undefined)),
				onChange: (state) => store(keys.friends(list), state)
			}
		)
	);

	// A tab switch, or a background refresh of the cached list, lands here.
	$effect(() => {
		const { list, state } = data;
		untrack(() => lists[FRIEND_TABS.indexOf(list)].seed(state));
	});
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
	const remove = (f: Friendship) =>
		run(f, t('Remove {name} as friend?').replace('{name}', other(f).username), () =>
			deleteFriendship(f.id)
		);

	const empty = ['You have no friends yet. Find people in Search.', 'No pending requests.'];
</script>

<div class="page">
	<div class="controls">
		<TabBar
			tabs={[t('Friends'), t('Requests')]}
			index={tab}
			onchange={select}
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
						{/if}
					{/snippet}
				</UserRow>
			{/each}
		</div>
	{:else if current.error}
		<FillCenter><p class="error-text">{current.error}</p></FillCenter>
	{:else if !current.loading && !current.hasMore}
		<p class="muted">{t(empty[tab])}</p>
	{/if}

	{#if current.loading || (current.items.length === 0 && current.hasMore)}
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
	/* FriendshipsPage: tab bar and list both inset 10px, 10px apart. */
	.controls {
		padding: 0 10px 10px;
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
