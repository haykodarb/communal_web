<script lang="ts">
	import { tick } from 'svelte';

	// Calls `onvisible` when the end of a list gets within a screen and a half
	// of the viewport, so the next page loads before you reach it. Put it after
	// the list.
	let { onvisible }: { onvisible: () => void | Promise<void> } = $props();

	let element: HTMLElement;

	$effect(() => {
		const observer = new IntersectionObserver(
			async (entries) => {
				if (!entries[0].isIntersecting) return;
				const before = element.offsetTop;
				await onvisible();
				await tick();
				// The observer only fires on changes; if a page landed but the end is
				// still within reach (short pages, tall screens), look again. Only when
				// the list actually grew, so a finished list doesn't loop.
				if (element.offsetTop !== before) {
					observer.unobserve(element);
					observer.observe(element);
				}
			},
			{ rootMargin: '0px 0px 150% 0px' }
		);
		observer.observe(element);
		return () => observer.disconnect();
	});
</script>

<div bind:this={element} class="sentinel"></div>

<style>
	.sentinel {
		height: 1px;
	}
</style>
