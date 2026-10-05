<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { signedStorageUrl } from '#lib/data/api.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { currentProfile } from '#lib/profile.svelte.ts';

	let { onNavigate }: { onNavigate?: () => void } = $props();

	// Order mirrors the Flutter CommonDrawerWidget.
	const items = [
		{ href: '/my-profile', key: 'Profile', icon: 'user' },
		{ href: '/notifications', key: 'Notifications', icon: 'bell' },
		{ href: '/search', key: 'Search', icon: 'search' },
		{ href: '/messages', key: 'Messages', icon: 'message' },
		{ href: '/my-books', key: 'My Books', icon: 'book' },
		{ href: '/communities', key: 'Communities', icon: 'community' },
		{ href: '/loans', key: 'Loans', icon: 'loans' }
	];

	const profile = $derived(currentProfile.value);
	let avatarUrl = $state<string | null>(null);

	$effect(() => {
		const userId = auth.user?.id;
		if (userId && currentProfile.value?.id !== userId) currentProfile.load(userId);
	});

	$effect(() => {
		const path = profile?.avatar_path;
		if (path) signedStorageUrl('profile_avatars', path).then((url) => (avatarUrl = url));
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
		goto('/auth');
	}
</script>

<div class="drawer">
	<button class="header" type="button" onclick={() => go('/my-profile')}>
		<div class="avatar">
			{#if avatarUrl}
				<img src={avatarUrl} alt="" />
			{:else}
				<Icon name="user" size={30} />
			{/if}
		</div>
		<span class="username">{profile?.username ?? ''}</span>
	</button>

	<nav class="items">
		{#each items as item (item.href)}
			<button
				class="item"
				class:active={isActive(item.href)}
				type="button"
				onclick={() => go(item.href)}
			>
				<Icon name={item.icon} size={26} />
				<span>{t(item.key)}</span>
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
	.avatar {
		width: 80px;
		height: 80px;
		flex: 0 0 80px;
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--primary) 18%, transparent);
		color: var(--primary);
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.username {
		font-size: 16px;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* Compact fixed-height rows; the spacer absorbs the remaining space. */
	.items {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
	}
	.item,
	.logout {
		display: flex;
		align-items: center;
		gap: 16px;
		height: 62px;
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
	.spacer {
		flex: 1 1 0;
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
		border-top: 2px solid var(--surface);
	}
</style>
