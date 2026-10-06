<script lang="ts">
	import type { Snippet } from 'svelte';

	// Flutter's SliverAppBar around a search bar. `floating` (the default) hides
	// it while scrolling down and brings it back as soon as you scroll up;
	// otherwise it stays pinned. The 10px under it is CommonListView's padding,
	// the gap between the search bar and the first item.
	// Put it directly inside the element that also holds the list, or `sticky`
	// stops at its parent's end.
	let { floating = true, children }: { floating?: boolean; children: Snippet } = $props();

	let hidden = $state(false);
	let marker: HTMLElement;

	$effect(() => {
		if (!floating) return;
		let last = window.scrollY;
		const onScroll = () => {
			const y = window.scrollY;
			if (Math.abs(y - last) < 4) return;
			// Hide only once the bar would otherwise stick (its spot has scrolled
			// under the top of the window, or the mobile app bar).
			const stuck = marker.getBoundingClientRect().top < 60;
			hidden = y > last && stuck;
			last = y;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<div bind:this={marker} class="marker"></div>
<div class="bar" class:hidden>{@render children()}</div>

<style>
	.marker {
		height: 0;
	}
	.bar {
		position: sticky;
		/* Below the mobile app bar on top-level pages (set by the app layout). */
		top: var(--sticky-top, 0px);
		z-index: 10;
		padding-bottom: 10px;
		background: var(--surface);
		transition: transform 200ms ease;
	}
	.bar.hidden {
		transform: translateY(calc(-100% - var(--sticky-top, 0px)));
	}
</style>
