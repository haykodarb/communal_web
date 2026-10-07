<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Icon from './Icon.svelte';
	import { drawer } from '#lib/drawer.svelte.ts';
	import { nav } from '#lib/nav.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';

	// The back control of a pushed page's bar. It goes back through the browser
	// history. On mobile only, when the app opened on this page there is nothing
	// to go back to, so it opens the drawer instead (or falls back to `to` on
	// screens without one, like the auth pages). On desktop the drawer isn't
	// reachable, so it's always a back arrow.
	let {
		size = 30,
		menu = true,
		to
	}: { size?: number; menu?: boolean; to?: string } = $props();

	const mobileQuery = '(max-width: 799.98px)';
	let isMobile = $state(typeof window !== 'undefined' && matchMedia(mobileQuery).matches);
	onMount(() => {
		const mq = matchMedia(mobileQuery);
		const onChange = () => (isMobile = mq.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	const canGoBack = $derived(nav.depth > 0);
	const showMenu = $derived(!canGoBack && menu && isMobile);

	function handleClick() {
		if (showMenu) drawer.open = true;
		else if (!canGoBack && to) goto(to);
		else history.back();
	}
</script>

<button
	class="btn"
	type="button"
	aria-label={showMenu ? t('Menu') : t('Back')}
	onclick={handleClick}
>
	<Icon name={showMenu ? 'menu' : 'chevron-left'} {size} />
</button>

<style>
	.btn {
		display: flex;
		padding: 4px;
		border: none;
		border-radius: 50%;
		background: none;
		color: var(--on-surface);
		cursor: pointer;
	}
</style>
