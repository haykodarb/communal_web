<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initAuth } from '#lib/auth.svelte.ts';
	import { i18n } from '#lib/i18n.svelte.ts';
	import { theme } from '#lib/theme.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

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
