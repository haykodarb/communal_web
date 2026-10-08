<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Avatar from "./Avatar.svelte";
	import Icon from "./Icon.svelte";
	import { auth } from "#lib/auth.svelte.ts";
	import { t } from "#lib/i18n.svelte.ts";
	import { currentProfile } from "#lib/profile.svelte.ts";
	import { unread } from "#lib/unread.svelte.ts";
	import { backOut } from "svelte/easing";
	import { scale } from "#lib/motion.ts";

	let { onNavigate }: { onNavigate?: () => void } = $props();

	const badges: Record<string, () => number> = {
		"/notifications": () => unread.notifications,
		"/messages": () => unread.messages,
		"/friends": () => unread.friendRequests,
	};

	// Order mirrors the Flutter CommonDrawerWidget, plus Home (web only for now).
	// Profile is reached through the header.
	const items = [
		{ href: "/home", key: "Home", icon: "home" },
		{ href: "/search", key: "Search", icon: "search" },
		{ href: "/notifications", key: "Notifications", icon: "bell" },
		{ href: "/messages", key: "Messages", icon: "message" },
		{ href: "/friends", key: "Friends", icon: "users" },
		{ href: "/my-books", key: "My Books", icon: "library" },
		// Communities is commented out of the Flutter drawer too; the pages still work by URL.
		// Loans is reached from Home's "See all".
		{ href: "/settings", key: "Settings", icon: "gear" },
	];

	const profile = $derived(currentProfile.value);

	$effect(() => {
		const userId = auth.user?.id;
		if (userId && currentProfile.value?.id !== userId)
			currentProfile.load(userId);
	});

	const current = $derived(page.url.pathname);
	const isActive = (href: string) =>
		current === href || current.startsWith(href + "/");

	async function logout() {
		onNavigate?.();
		await auth.signOut();
		goto("/auth");
	}
</script>

<div class="drawer">
	<a
		class="header pressable"
		href="/my-profile"
		onclick={() => onNavigate?.()}
	>
		{#if profile}<Avatar {profile} size={80} />{/if}
		<!-- The whole header is the link; "View profile" only says so. -->
		<span class="identity">
			<span class="username">{profile?.username ?? ""}</span>
			<span class="view-profile">
				<span class="view-profile-label">{t("View profile")}</span><Icon
					name="chevron-right"
					size={18}
				/>
			</span>
		</span>
	</a>

	<nav class="items" style:flex-grow={items.length}>
		{#each items as item (item.href)}
			<a
				class="item pressable"
				class:active={isActive(item.href)}
				aria-current={isActive(item.href) ? "page" : undefined}
				href={item.href}
				onclick={() => onNavigate?.()}
			>
				<Icon name={item.icon} size={26} />
				<span>{t(item.key)}</span>
				{#if (badges[item.href]?.() ?? 0) > 0}
					<!-- Pops whenever the count changes. -->
					{#key badges[item.href]()}
						<span
							class="badge"
							in:scale|global={{
								start: 0.4,
								duration: 260,
								easing: backOut,
							}}
						>
							{badges[item.href]()}
						</span>
					{/key}
				{/if}
			</a>
		{/each}
	</nav>

	<div class="spacer"></div>
	<div class="version">Version: {__APP_VERSION__}</div>
	<button class="logout" type="button" onclick={logout}>
		<Icon name="logout" size={26} />
		<span>{t("Logout")}</span>
	</button>
</div>

<style>
	.drawer {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--surface-container);
	}
	/* As tall as one and a half rows: it grows with the window like they do
	   (the items take one flex unit each), but never squeezes the 80px avatar. */
	.header {
		flex: 1.5 1 0;
		min-height: 100px;
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 10px 30px;
		border: none;
		cursor: pointer;
		text-align: left;
		text-decoration: none;
		color: var(--on-surface);
	}
	.identity {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.username {
		font-size: 16px;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* The text's line box matches the 18px chevron so the two center on each
	   other. */
	.view-profile {
		align-self: flex-start;
		display: flex;
		align-items: center;
		padding-bottom: 2px;
		font-size: 14px;
		font-weight: 500;
		line-height: 18px;
		color: var(--primary);
	}
	/* Underlined like UserLink: a 1px stripe under the text that grows from the
	   left while the whole header is hovered, pressed or focused. It sits 2px
	   below the line box; the negative margin keeps that padding out of the
	   centering, so the text stays level with the chevron. */
	.view-profile-label {
		padding-bottom: 2px;
		margin-bottom: -2px;
		background: linear-gradient(currentColor, currentColor) left bottom / 0% 1px
			no-repeat;
		transition: background-size 220ms var(--ease-standard);
	}
	@media (hover: hover) {
		.header:hover .view-profile-label {
			background-size: 100% 1px;
		}
	}
	.header:active .view-profile-label,
	.header:focus-visible .view-profile-label {
		background-size: 100% 1px;
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
		text-decoration: none;
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
