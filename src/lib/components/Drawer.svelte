<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Avatar from './Avatar.svelte';
	import Icon from './Icon.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { currentProfile } from '#lib/profile.svelte.ts';
	import { unread } from '#lib/unread.svelte.ts';

	let { onNavigate }: { onNavigate?: () => void } = $props();

	const badges: Record<string, () => number> = {
		'/app/notifications': () => unread.notifications,
		'/app/messages': () => unread.messages,
		'/app/friends': () => unread.friendRequests
	};

	// Order mirrors the Flutter CommonDrawerWidget.
	const items = [
		{ href: '/app/my-profile', key: 'Profile', icon: 'user' },
		{ href: '/app/notifications', key: 'Notifications', icon: 'bell' },
		{ href: '/app/search', key: 'Search', icon: 'search' },
		{ href: '/app/messages', key: 'Messages', icon: 'message' },
		{ href: '/app/friends', key: 'Friends', icon: 'users' },
		{ href: '/app/my-books', key: 'My Books', icon: 'library' },
		// Communities is commented out of the Flutter drawer too; the pages still work by URL.
		{ href: '/app/loans', key: 'Loans', icon: 'loans' }
	];

	const profile = $derived(currentProfile.value);

	$effect(() => {
		const userId = auth.user?.id;
		if (userId && currentProfile.value?.id !== userId) currentProfile.load(userId);
	});

	const current = $derived(page.url.pathname);
	const isActive = (href: string) => current === href || current.startsWith(href + '/');

	function go(href: string) {
		onNavigate?.();
		goto(href);
	}

	async function logout() {
		onNavigate?.();
		await auth.signOut();
		goto('/app/auth');
	}
</script>

<div class="drawer">
	<button class="header" type="button" onclick={() => go('/app/my-profile')}>
		{#if profile}<Avatar {profile} size={80} />{/if}
		<span class="username">{profile?.username ?? ''}</span>
	</button>

	<nav class="items" style:flex-grow={items.length}>
		{#each items as item (item.href)}
			<button
				class="item"
				class:active={isActive(item.href)}
				type="button"
				onclick={() => go(item.href)}
			>
				<Icon name={item.icon} size={26} />
				<span>{t(item.key)}</span>
				{#if (badges[item.href]?.() ?? 0) > 0}
					<span class="badge">{badges[item.href]()}</span>
				{/if}
			</button>
		{/each}
	</nav>

	<div class="spacer"></div>
	<div class="version">{t('Web')}</div>
	<button class="logout" type="button" onclick={logout}>
		<Icon name="logout" size={26} />
		<span>{t('Logout')}</span>
	</button>
</div>

<style>
	.drawer {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--surface-container);
	}
	.header {
		height: 150px;
		flex: 0 0 150px;
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 10px 30px;
		background: var(--surface);
		border: none;
		cursor: pointer;
		text-align: left;
		color: var(--on-surface);
	}
	.username {
		font-size: 16px;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* Flutter: every row (and Logout) is Expanded and a flex-3 spacer sits above
	   the version line, so rows grow with the window height. */
	.items {
		flex: 1 1 0;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
	.item,
	.logout {
		display: flex;
		align-items: center;
		gap: 16px;
		flex: 1 1 0;
		min-height: 44px;
		padding: 0 20px;
		border: none;
		background: none;
		color: var(--on-surface);
		font-size: 16px;
		cursor: pointer;
		text-align: left;
	}
	.items .item {
		border-top: 2px solid var(--surface);
	}
	.item.active {
		color: var(--primary);
	}
	/* Flutter: 25px circle outlined in primary. */
	.badge {
		margin-left: auto;
		width: 25px;
		height: 25px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1.5px solid var(--primary);
		border-radius: 50%;
		color: var(--primary);
		font-size: 12px;
		font-weight: 600;
	}
	.spacer {
		flex: 3 1 0;
		min-height: 0;
		border-top: 2px solid var(--surface);
	}
	.version {
		flex: 0 0 auto;
		padding: 8px 20px;
		font-size: 14px;
		color: var(--on-surface-variant);
		border-top: 2px solid var(--surface);
	}
	.logout {
		flex: 1 1 0;
		max-height: 70px;
		margin-bottom: 10px;
		border-top: 2px solid var(--surface);
	}
</style>
