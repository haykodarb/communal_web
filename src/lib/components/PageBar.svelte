<script lang="ts">
	import type { Snippet } from 'svelte';
	import BackButton from './BackButton.svelte';

	// The app's AppBar (light_theme.dart: centered 18px/600 title, 30px icons):
	// back button, centered title and optional trailing actions.
	let {
		title,
		mobileTitle = false,
		actions
	}: {
		title: string;
		/** Only show the title on mobile, like Flutter's `Responsive.isMobile(context) ? Text(...) : null`. */
		mobileTitle?: boolean;
		actions?: Snippet;
	} = $props();
</script>

<header class="bar">
	<div class="leading"><BackButton /></div>
	<h1 class:mobile-only={mobileTitle}>{title}</h1>
	<div class="actions">{@render actions?.()}</div>
</header>

<style>
	.bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		height: 56px;
		padding: 0 8px;
	}
	h1 {
		min-width: 0;
		font-size: 18px;
		font-weight: 600;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	@media (min-width: 800px) {
		h1.mobile-only {
			visibility: hidden;
		}
	}
	.leading {
		justify-self: start;
	}
	.actions {
		justify-self: end;
		display: flex;
		align-items: center;
	}
</style>
