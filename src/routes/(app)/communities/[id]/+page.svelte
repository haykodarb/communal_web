<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Fab from '#lib/components/Fab.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import CommunityBooks from '#lib/components/community/CommunityBooks.svelte';
	import CommunityDiscussions from '#lib/components/community/CommunityDiscussions.svelte';
	import CommunityMembers from '#lib/components/community/CommunityMembers.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { getCommunityById } from '#lib/data/api.ts';
	import type { Community } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	// CommunitySpecificPage: Books / Discuss / Members with the floating
	// bottom tab bar. The tab lives in ?tab= so back navigation keeps it.
	const tabs = [
		{ key: 'books', label: 'Books', icon: 'book' },
		{ key: 'discuss', label: 'Discuss', icon: 'chats' },
		{ key: 'members', label: 'Members', icon: 'community' }
	] as const;
	type Tab = (typeof tabs)[number]['key'];

	let community = $state<Community | null>(null);
	let loading = $state(true);

	const id = $derived(page.params.id!);
	const tab = $derived<Tab>(
		(tabs.find((t) => t.key === page.url.searchParams.get('tab'))?.key ?? 'books') as Tab
	);

	$effect(() => {
		loading = true;
		getCommunityById(id, auth.user!.id)
			.then((result) => (community = result))
			.finally(() => (loading = false));
	});

	function selectTab(key: Tab) {
		const url = new URL(page.url.href);
		if (key === 'books') url.searchParams.delete('tab');
		else url.searchParams.set('tab', key);
		goto(url, { replace: true, reset: false });
	}
</script>

<div class="page">
	<header class="bar">
		<button class="icon-btn" type="button" aria-label={t('Back')} onclick={() => goto('/communities')}>
			<Icon name="chevron-left" size={28} />
		</button>
		<h1>{community?.name ?? ''}</h1>
		{#if community}
			<button
				class="icon-btn"
				type="button"
				aria-label={t('Settings')}
				onclick={() => goto(`/communities/${id}/settings`)}
			>
				<Icon name="gear" size={22} />
			</button>
		{/if}
	</header>

	{#if loading}
		<p class="muted">{t('Loading…')}</p>
	{:else if community}
		<div class="content">
			{#if tab === 'books'}
				<CommunityBooks communityId={id} />
			{:else if tab === 'discuss'}
				<CommunityDiscussions communityId={id} />
			{:else}
				<CommunityMembers {community} />
			{/if}
		</div>

		{#if tab === 'discuss'}
			<Fab
				icon="plus"
				bottom={100}
				label={t('Create topic')}
				onclick={() => goto(`/communities/${id}/discussions/create`)}
			/>
		{:else if tab === 'members' && community.isCurrentUserAdmin}
			<Fab
				icon="user-plus"
				bottom={100}
				label={t('Invite user')}
				onclick={() => goto(`/communities/${id}/members/invite`)}
			/>
		{/if}

		<nav class="tabbar" aria-label={community.name}>
			{#each tabs as item (item.key)}
				<button
					type="button"
					class="tab"
					class:selected={tab === item.key}
					aria-current={tab === item.key ? 'page' : undefined}
					onclick={() => selectTab(item.key)}
				>
					<Icon name={item.icon} size={22} />
					<span class="label">{t(item.label)}</span>
				</button>
			{/each}
		</nav>
	{:else}
		<p class="muted">{t('Community not found.')}</p>
	{/if}
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
	}
	h1 {
		flex: 1;
		min-width: 0;
		font-size: 20px;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.icon-btn {
		display: flex;
		padding: 6px;
		border: none;
		background: none;
		color: var(--on-surface);
		cursor: pointer;
	}
	.content {
		flex: 1;
		padding-bottom: 100px;
	}
	/* Flutter: 70px pill 10px off the bottom, selected item 3:2. It is 200px
	   wide there; 240px here so the selected label is not clipped. */
	.tabbar {
		position: sticky;
		bottom: 10px;
		align-self: center;
		z-index: 14;
		display: flex;
		width: 240px;
		height: 70px;
		margin: 0 10px 10px;
		padding: 0 8px;
		border-radius: 50px;
		background: var(--surface-container);
		box-shadow: 0 0 2px var(--shadow);
	}
	.tab {
		flex: 2 1 0;
		min-width: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		margin: 8px 0;
		border: none;
		border-radius: 50px;
		background: none;
		color: var(--primary);
		cursor: pointer;
		transition:
			flex-grow 200ms ease,
			background-color 200ms ease;
	}
	.tab.selected {
		flex-grow: 3;
		background: color-mix(in srgb, var(--primary) 15%, transparent);
	}
	.label {
		max-width: 0;
		overflow: hidden;
		opacity: 0;
		font-size: 14px;
		font-weight: 600;
		white-space: nowrap;
		transition:
			opacity 200ms ease,
			max-width 200ms ease;
	}
	.selected .label {
		max-width: 100px;
		opacity: 1;
	}
	.muted {
		padding: 20px;
		color: var(--on-surface-variant);
	}
</style>
