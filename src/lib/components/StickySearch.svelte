<script lang="ts">
	import type { Snippet } from 'svelte';

	// Flutter's SliverAppBar around a search bar. `floating` (the default) hides
	// it while scrolling down and brings it back as soon as you scroll up;
	// otherwise it stays pinned. Like the 55px toolbar there, it has a little
	// room above the 50px bar; the gap below belongs to the list (CommonListView's
	// 10px padding), so it scrolls away with the content.
	// Put it directly inside the element that also holds the list, or `sticky`
	// stops at its parent's end.
	let { floating = true, children }: { floating?: boolean; children: Snippet } = $props();

	let hidden = $state(false);
	let stuck = $state(false);
	let marker: HTMLElement;
	let bar: HTMLElement;

	$effect(() => {
		let last = window.scrollY;
		const onScroll = () => {
			const y = window.scrollY;
			// Stuck once its spot has scrolled under its sticky top (the top of
			// the window, or the mobile app bar).
			const top = marker.getBoundingClientRect().top;
			stuck = top < parseFloat(getComputedStyle(bar).top) + 1;
			if (!floating || Math.abs(y - last) < 4) return;
			// Hide only once the bar would otherwise stick.
			hidden = y > last && top < 60;
			last = y;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<div bind:this={marker} class="marker"></div>
<div bind:this={bar} class="bar" class:stuck class:hidden>{@render children()}</div>

<style>
	.marker {
		height: 0;
	}
	.bar {
		position: sticky;
		/* Below the mobile app bar on top-level pages (set by the app layout). */
		top: var(--sticky-top, 0px);
		z-index: 10;
		padding: 3px 0;
		background: var(--surface);
		transition:
			transform 200ms ease,
			box-shadow 200ms ease,
			padding-top 200ms ease,
			margin-bottom 200ms ease;
	}
	/* While the list scrolls under it: the bars' drop shadow (app.css) and 5px
	   above the field. The negative margin takes back the extra padding, so the
	   list doesn't shift. */
	.bar.stuck {
		padding-top: 5px;
		margin-bottom: -2px;
		box-shadow: var(--bar-shadow);
	}
	/* No shadow while hidden: it would peek out below the top of the window. */
	.bar.hidden {
		transform: translateY(calc(-100% - var(--sticky-top, 0px)));
		box-shadow: none;
	}
</style>
