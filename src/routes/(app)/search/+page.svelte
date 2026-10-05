<script lang="ts">
	import CommunityCard from '#lib/components/CommunityCard.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import { searchCommunities } from '#lib/data/api.ts';
	import type { Community } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let results = $state<Community[]>([]);
	let searched = $state(false);

	async function search(query: string) {
		if (!query.trim()) {
			results = [];
			searched = false;
			return;
		}
		searched = true;
		results = await searchCommunities(query);
	}
</script>

<div class="page">
	<SearchBar onSearch={search} />

	{#if searched && results.length === 0}
		<p class="muted">{t('No communities found.')}</p>
	{:else}
		<div class="list">
			{#each results as community (community.id)}
				<CommunityCard {community} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.page {
		min-height: 100vh;
		padding-bottom: 40px;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px 5px;
	}
	.muted {
		padding: 20px 10px;
		color: var(--on-surface-variant);
	}
</style>
