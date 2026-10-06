<script lang="ts">
	import { goto } from '$app/navigation';
	import Loading from '#lib/components/Loading.svelte';
	import CommunityCard from '#lib/components/CommunityCard.svelte';
	import Fab from '#lib/components/Fab.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { getCommunitiesForUser } from '#lib/data/api.ts';
	import type { Community } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { getPinnedCommunities, setCommunityPinned } from '#lib/pins.ts';

	let communities = $state<Community[]>([]);
	let loading = $state(true);
	let error = $state('');
	let pinned = $state<string[]>(getPinnedCommunities());

	// Pinned communities first, as CommunityListController sorts them.
	const sorted = $derived([
		...communities.filter((c) => pinned.includes(c.id)),
		...communities.filter((c) => !pinned.includes(c.id))
	]);

	function togglePin(id: string) {
		const next = !pinned.includes(id);
		setCommunityPinned(id, next);
		pinned = next ? [...pinned, id] : pinned.filter((x) => x !== id);
	}

	$effect(() => {
		const userId = auth.user?.id;
		if (!userId) return;
		loading = true;
		error = '';
		getCommunitiesForUser(userId)
			.then((result) => {
				communities = result;
			})
			.catch((e) => {
				error = errorMessage(e);
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

<div class="page">
	{#if error}
		<p class="error">{error}</p>
	{:else if loading}
		<Loading />
	{:else if communities.length === 0}
		<div class="empty">
			<p>{t('You are not a member of any communities.')}</p>
			<p>{t('You can create your own or request an invite from the admins of other communities.')}</p>
		</div>
	{:else}
		<div class="list">
			{#each sorted as community (community.id)}
				<CommunityCard
					{community}
					pinned={pinned.includes(community.id)}
					onpin={() => togglePin(community.id)}
				/>
			{/each}
		</div>
	{/if}

	<Fab icon="plus" label={t('Create community')} onclick={() => goto('/communities/create')} />
</div>

<style>
	.page {
		min-height: 100vh;
		padding: 10px 10px 0;
		display: flex;
		flex-direction: column;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.error {
		padding: 0 10px;
		color: var(--error);
	}
	.empty {
		margin-top: 40px;
		padding: 0 20px;
		text-align: center;
		color: var(--on-surface-variant);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
</style>
