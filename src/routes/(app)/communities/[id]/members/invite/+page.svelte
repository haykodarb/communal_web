<script lang="ts">
	import { page } from '$app/state';
	import Loading from '#lib/components/Loading.svelte';
	import { goto } from '$app/navigation';
	import PageBar from '#lib/components/PageBar.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import { cancelInvite, inviteToCommunity, searchUsersNotInCommunity } from '#lib/data/api.ts';
	import type { Profile } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { profileHref } from '#lib/links.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { createPaged } from '#lib/paged.svelte.ts';

	// CommunityInvitePage: search users outside the community and invite them;
	// an invite sent from here can be undone.
	let search = $state('');
	/** user id -> membership id of the invite sent from this page. */
	let sent = $state<Record<string, string>>({});
	let busyId = $state<string | null>(null);
	let error = $state('');
	let confirmDialog: ConfirmDialog;
	let confirmTitle = $state('');

	const id = $derived(page.params.id!);
	const users = createPaged<Profile>((p) => searchUsersNotInCommunity(id, search, p), 20);

	async function invite(user: Profile) {
		busyId = user.id;
		error = '';
		try {
			sent[user.id] = await inviteToCommunity(id, user.id);
		} catch (e) {
			error = errorMessage(e) || t('Error in inviting user.');
		}
		busyId = null;
	}

	async function undo(user: Profile) {
		confirmTitle = t('Undo invitation to {name}?').replace('{name}', user.username);
		if (!(await confirmDialog.confirm())) return;
		busyId = user.id;
		error = '';
		try {
			await cancelInvite(sent[user.id]);
			delete sent[user.id];
		} catch {
			error = t('Error in rescinding invitation.');
		}
		busyId = null;
	}
</script>

<div class="page">
	<PageBar title={t('Invite user')} onback={() => goto(`/communities/${id}?tab=members`)} />

	<SearchBar bind:value={search} onSearch={() => users.reset()} />

	{#if error}
		<p class="error-text">{error}</p>
	{/if}

	<ul class="list">
		{#each users.items as user (user.id)}
			<li class="user">
				<a class="who" href={profileHref(user)}>
					<Avatar profile={user} size={44} />
					<span>{user.username}</span>
				</a>
				{#if sent[user.id]}
					<button class="action undo" type="button" disabled={busyId === user.id} onclick={() => undo(user)}>
						{t('Undo')}
					</button>
				{:else}
					<button class="action" type="button" disabled={busyId === user.id} onclick={() => invite(user)}>
						{t('Invite')}
					</button>
				{/if}
			</li>
		{/each}
	</ul>
	{#if users.loading}
		<Loading />
	{/if}
	<Sentinel onvisible={users.loadMore} />
</div>

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	.page {
		padding: 10px 20px 40px;
	}
	.list {
		list-style: none;
		margin: 16px 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.user {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border-radius: 10px;
		background: var(--surface-container);
	}
	.who {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 12px;
		color: inherit;
		font-weight: 600;
		text-decoration: none;
	}
	.action {
		min-width: 80px;
		height: 36px;
		padding: 0 14px;
		border: 2px solid var(--primary);
		border-radius: 999px;
		background: var(--primary);
		color: var(--on-primary);
		font-weight: 600;
		cursor: pointer;
	}
	.action.undo {
		background: none;
		color: var(--primary);
	}
	.action:disabled {
		opacity: 0.5;
	}
	.error-text {
		margin-top: 10px;
		font-size: 13px;
		color: var(--error);
	}
</style>
