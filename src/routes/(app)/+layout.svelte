<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Drawer from '#lib/components/Drawer.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { subscribeToDatabaseChanges, unsubscribeFromDatabase } from '#lib/realtime.ts';
	import { unread } from '#lib/unread.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	let width = $state(0);
	let drawerOpen = $state(false);

	const isMobile = $derived(width > 0 && width < 800);

	const titles: Record<string, string> = {
		'/my-books': 'My Books',
		'/communities': 'Communities',
		'/loans': 'Loans',
		'/messages': 'Messages',
		'/friends': 'Friends',
		'/notifications': 'Notifications',
		'/my-profile': 'My Profile',
		'/search': 'Search'
	};
	const titleKey = $derived(
		Object.keys(titles).find((path) => page.url.pathname.startsWith(path)) ?? '/my-books'
	);
	// Like Flutter, only the drawer destinations get the menu app bar on mobile;
	// pushed pages (books, loans, chats, ...) show their own back bar instead.
	const topLevel = $derived(page.url.pathname in titles);

	$effect(() => {
		if (auth.ready && !auth.session) {
			goto('/auth');
		}
	});

	// Realtime + unread counters for the signed-in user (CommonDrawerController.onInit).
	// Keyed on the id: Supabase emits new session objects (e.g. token refresh)
	// for the same user, which must not tear the subscription down.
	const userId = $derived(auth.user?.id);
	$effect(() => {
		if (!userId) return;
		subscribeToDatabaseChanges();
		unread.start(userId);
		return () => {
			unread.stop();
			unsubscribeFromDatabase();
		};
	});
</script>

<svelte:window bind:innerWidth={width} />

{#if auth.ready && auth.session}
	{#if isMobile}
		<div class="mobile-shell">
			{#if topLevel}
			<header class="appbar">
				<button
					class="appbar-btn"
					type="button"
					aria-label={t('Menu')}
					onclick={() => (drawerOpen = true)}
				>
					<Icon name="menu" size={22} />
				</button>
				<span class="appbar-title">{t(titles[titleKey])}</span>
				<span class="appbar-spacer"></span>
			</header>
			{/if}

			{#if drawerOpen}
				<button
					class="scrim"
					type="button"
					aria-label={t('Close')}
					onclick={() => (drawerOpen = false)}
				></button>
				<aside class="drawer-panel">
					<Drawer onNavigate={() => (drawerOpen = false)} />
				</aside>
			{/if}

			<main class="content" style:--sticky-top={topLevel ? '56px' : '0px'}>
				{@render children()}
			</main>
		</div>
	{:else}
		<div class="desktop-shell">
			<div class="side-spacer"></div>
			<aside class="drawer-col"><Drawer /></aside>
			<div class="content-col">{@render children()}</div>
			<div class="side-spacer"></div>
		</div>
	{/if}
{/if}

<style>
	.desktop-shell {
		display: flex;
		justify-content: center;
		min-height: 100vh;
		/* vw includes the scrollbar, so the columns keep their position and width
		   whether or not the page scrolls (no jump between short and long pages).
		   The extra width lands in the empty right spacer, under the scrollbar. */
		width: 100vw;
	}
	.side-spacer {
		flex: 1 1 0;
		min-width: 0;
	}
	.drawer-col {
		width: 300px;
		flex: 0 0 300px;
		height: 100vh;
		position: sticky;
		top: 0;
		border-right: 1px solid
			color-mix(in srgb, var(--on-surface-variant) 50%, transparent);
		border-left: 1px solid
			color-mix(in srgb, var(--on-surface-variant) 50%, transparent);
	}
	.content-col {
		width: 497px;
		flex: 0 0 497px;
		min-width: 0;
		position: relative;
		border-right: 1px solid
			color-mix(in srgb, var(--on-surface-variant) 50%, transparent);
	}

	/* Desktop (>=1400): the drawer and content share space proportionally. */
	@media (min-width: 1400px) {
		.side-spacer {
			flex: 2 1 0;
		}
		.drawer-col {
			width: auto;
			flex: 2 1 0;
		}
		.content-col {
			width: auto;
			flex: 3 1 0;
		}
	}

	/* Mobile */
	.mobile-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.appbar {
		display: flex;
		align-items: center;
		height: 56px;
		padding: 0 8px;
		background: var(--surface);
		box-shadow: 0 1px 4px color-mix(in srgb, var(--shadow) 40%, transparent);
		position: sticky;
		top: 0;
		z-index: 20;
	}
	.appbar-btn {
		background: none;
		border: none;
		color: var(--on-surface);
		padding: 8px;
		cursor: pointer;
		display: flex;
	}
	.appbar-title {
		flex: 1;
		text-align: center;
		font-size: 18px;
		font-weight: 600;
	}
	.appbar-spacer {
		width: 40px;
	}
	.scrim {
		position: fixed;
		inset: 0;
		border: none;
		background: rgba(0, 0, 0, 0.4);
		z-index: 30;
		cursor: pointer;
	}
	.drawer-panel {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 300px;
		z-index: 31;
		box-shadow: 0 0 24px rgba(0, 0, 0, 0.4);
	}
	.content {
		flex: 1;
		min-width: 0;
	}
</style>
