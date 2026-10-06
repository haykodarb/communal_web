<script lang="ts">
	import type { Snippet } from 'svelte';

	// Centers its content in the space left between here and the bottom of the
	// window (or of the scrolling panel it's in), like Flutter's
	// SliverFillRemaining + Center. It takes no layout space itself, so a short
	// page doesn't start scrolling. Used for first loads, load errors and
	// "not found" pages.
	let { children }: { children: Snippet } = $props();

	let block = $state<HTMLElement>();
	let height = $state(0);
	let remaining = $state(0);

	$effect(() => {
		if (!block) return;
		const el = block;
		let scroller: HTMLElement | null = el.parentElement;
		while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) {
			scroller = scroller.parentElement;
		}
		const measure = () => {
			const bottom = scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight;
			remaining = bottom - el.getBoundingClientRect().top;
		};
		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	});

	const top = $derived(Math.max(20, remaining / 2 - height / 2));
</script>

<div class="fill" bind:this={block}>
	<div class="spot" style:top="{top}px" bind:clientHeight={height}>{@render children()}</div>
</div>

<style>
	.fill {
		position: relative;
		height: 0;
	}
	.spot {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		/* Flutter's empty/error text is a 300px wide centered column. */
		width: min(300px, 100% - 40px);
		display: flex;
		justify-content: center;
		text-align: center;
	}
</style>
