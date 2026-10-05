<script lang="ts">
	// Calls `onvisible` whenever it scrolls into view; put it after a list.
	let { onvisible }: { onvisible: () => void } = $props();

	let element: HTMLElement;

	$effect(() => {
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) onvisible();
		});
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
