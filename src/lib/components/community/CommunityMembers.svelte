<script lang="ts">
	import { goto } from '$app/navigation';
	import Avatar from '../Avatar.svelte';
	import Icon from '../Icon.svelte';
	import SearchBar from '../SearchBar.svelte';
	import Sentinel from '../Sentinel.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import {
		getCommunityMembers,
		getMembershipRequestCount,
		removeMember,
		setMemberAdmin
	} from '#lib/data/api.ts';
	import type { Community, Member } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { profileHref } from '#lib/links.ts';
	import { createPaged } from '#lib/paged.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';

	// CommunityMembersPage: members with admin/kick actions for the owner and a
	// pending-requests banner for admins.
	let { community }: { community: Community } = $props();

	const PAGE_SIZE = 20;
	let search = $state('');
	let requestCount = $state(0);
	let busyId = $state<string | null>(null);
	let menuFor = $state<string | null>(null);
	let error = $state('');

	const userId = $derived(auth.user!.id);
	const isOwner = $derived(community.owner.id === userId);

	const members = createPaged<Member>(
		(page) => getCommunityMembers(community.id, { search, page, pageSize: PAGE_SIZE }),
		PAGE_SIZE
	);

	$effect(() => {
		if (community.isCurrentUserAdmin) {
			getMembershipRequestCount(community.id).then((n) => (requestCount = n));
		}
	});

	async function act(member: Member, action: () => Promise<void>) {
		menuFor = null;
		busyId = member.id;
		error = '';
		try {
			await action();
		} catch (e) {
			error = errorMessage(e);
		}
		busyId = null;
	}

	const toggleAdmin = (member: Member) =>
		act(member, async () => {
			await setMemberAdmin(community.id, member.id, !member.is_admin);
			member.is_admin = !member.is_admin;
		});

	const kick = (member: Member) =>
		act(member, async () => {
			await removeMember(community.id, member.id);
			members.items = members.items.filter((m) => m.id !== member.id);
		});
</script>

<svelte:window onclick={() => (menuFor = null)} />

{#if community.isCurrentUserAdmin && requestCount > 0}
	<a class="requests" href={`/communities/${community.id}/members/requests`}>
		{requestCount}
		{requestCount === 1 ? t('request pending') : t('requests pending')}
	</a>
{/if}

<div class="search"><SearchBar bind:value={search} onSearch={() => members.reset()} /></div>

{#if error}
	<p class="error-text">{error}</p>
{/if}

{#if members.items.length > 0}
	<ul class="list">
		{#each members.items as member (member.id)}
			<li class="member" class:busy={busyId === member.id}>
				<a class="who" href={profileHref(member)}>
					<Avatar profile={member} size={44} />
					<span class="name">{member.username}</span>
					{#if member.is_admin}<span class="tag">admin</span>{/if}
					{#if member.id === userId}<span class="tag you">{t('you')}</span>{/if}
				</a>

				{#if member.id !== userId}
					{#if isOwner}
						<div class="menu-wrap">
							<button
								class="icon-btn"
								type="button"
								aria-label={t('More')}
								aria-expanded={menuFor === member.id}
								onclick={(event) => {
									event.stopPropagation();
									menuFor = menuFor === member.id ? null : member.id;
								}}
							>
								<Icon name="more" size={20} />
							</button>
							{#if menuFor === member.id}
								<div class="menu" role="menu">
									<button type="button" role="menuitem" onclick={() => toggleAdmin(member)}>
										{member.is_admin ? t('Remove admin') : t('Make admin')}
									</button>
									<button type="button" role="menuitem" onclick={() => kick(member)}>
										{t('Kick')}
									</button>
								</div>
							{/if}
						</div>
					{/if}
					<button
						class="icon-btn message"
						type="button"
						aria-label={t('Messages')}
						onclick={() => goto(`/messages/${member.id}`)}
					>
						<Icon name="message" size={20} />
					</button>
				{/if}
			</li>
		{/each}
	</ul>
{:else if !members.loading && !members.hasMore}
	<p class="empty">{members.error || t('community-members-no-items')}</p>
{/if}
{#if members.loading}
	<p class="muted">{t('Loading…')}</p>
{/if}
<Sentinel onvisible={members.loadMore} />

<style>
	.requests {
		display: block;
		margin: 10px 20px 0;
		padding: 12px;
		border-radius: 10px;
		background: color-mix(in srgb, var(--primary) 15%, transparent);
		color: var(--primary);
		font-weight: 600;
		text-align: center;
		text-decoration: none;
	}
	.search {
		padding: 10px 20px;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.member {
		display: flex;
		align-items: center;
		gap: 5px;
		transition: opacity 150ms ease;
	}
	.member.busy {
		opacity: 0.5;
		pointer-events: none;
	}
	.who {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 12px;
		height: 60px;
		padding: 0 10px;
		border-radius: 5px;
		background: var(--surface-container);
		color: inherit;
		text-decoration: none;
	}
	.name {
		min-width: 0;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tag {
		padding: 2px 8px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--secondary) 20%, transparent);
		color: var(--secondary);
		font-size: 12px;
	}
	.tag.you {
		background: color-mix(in srgb, var(--primary) 20%, transparent);
		color: var(--primary);
	}
	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 60px;
		border: none;
		border-radius: 5px;
		background: var(--surface-container);
		color: var(--on-surface);
		cursor: pointer;
	}
	.icon-btn.message {
		width: 60px;
		background: var(--primary);
		color: var(--on-primary);
	}
	.menu-wrap {
		position: relative;
	}
	.menu {
		position: absolute;
		right: 0;
		top: calc(100% + 4px);
		z-index: 20;
		min-width: 160px;
		padding: 6px 0;
		border-radius: 10px;
		background: var(--surface);
		box-shadow: 0 6px 18px color-mix(in srgb, var(--shadow) 45%, transparent);
		display: flex;
		flex-direction: column;
	}
	.menu button {
		padding: 10px 16px;
		border: none;
		background: none;
		color: var(--on-surface);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	.menu button:hover {
		background: var(--surface-container);
	}
	.error-text {
		padding: 0 20px 8px;
		font-size: 13px;
		color: var(--error);
	}
	.empty,
	.muted {
		padding: 30px 20px;
		text-align: center;
		white-space: pre-line;
		color: var(--on-surface-variant);
	}
</style>
