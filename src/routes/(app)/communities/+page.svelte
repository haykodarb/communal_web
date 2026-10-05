<script lang="ts">
	import { goto } from '$app/navigation';
	import CommunityCard from '#lib/components/CommunityCard.svelte';
	import Fab from '#lib/components/Fab.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { getCommunitiesForUser } from '#lib/data/api.ts';
	import type { Community } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';

	let communities = $state<Community[]>([]);
	let loading = $state(true);
	let error = $state('');

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
		<p class="muted">{t('Loading…')}</p>
	{:else if communities.length === 0}
		<div class="empty">
			<p>{t('You are not a member of any communities.')}</p>
			<p>{t('You can create your own or request an invite from the admins of other communities.')}</p>
		</div>
	{:else}
		<div class="list">
			{#each communities as community (community.id)}
				<CommunityCard {community} />
			{/each}
		</div>
	{/if}

	<Fab icon="plus" label={t('Create community')} onclick={() => goto('/communities/create')} />
</div>

<style>
	.page {
		min-height: 100vh;
		padding: 20px 5px 0;
		display: flex;
		flex-direction: column;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.muted {
		padding: 0 10px;
		color: var(--on-surface-variant);
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
