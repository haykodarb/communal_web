<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { initAuth } from '#lib/auth.svelte.ts';
	import { i18n } from '#lib/i18n.svelte.ts';
	import { nav } from '#lib/nav.svelte.ts';
	import { theme } from '#lib/theme.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Track how deep into the app we've navigated, so back buttons know whether
	// there's an app page to return to.
	afterNavigate((navigation) => {
		if (navigation.type === 'enter') {
			nav.depth = 0;
		} else if (navigation.type === 'popstate') {
			nav.depth = Math.max(0, nav.depth - 1);
		} else {
			nav.depth += 1;
		}
	});

	onMount(() => {
		theme.apply();
		i18n.set(i18n.locale);
		initAuth();
		// Touch screens can't hover, so preload links' data as they scroll into
		// view instead (the cache makes repeats free).
		if (matchMedia('(hover: none)').matches) {
			document.body.dataset.sveltekitPreloadData = 'viewport';
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="/assets/favicon.ico" sizes="any" />
	<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
	<link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

{@render children()}
