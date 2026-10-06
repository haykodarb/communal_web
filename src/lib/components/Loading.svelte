<script lang="ts" module>
	// Port of LoadingAnimationWidget.threeArchedCircle (loading_animation_widget),
	// which the Flutter app shows through CommonLoadingBody: three arcs that
	// shrink while the group spins 240°, then grow back during another 120°.
	const DURATION = 2000;
	const GAP = Math.PI / 12;
	const MIN = Math.PI / 36;
	const MAX = (2 * Math.PI) / 3 - GAP;
	const STARTS = [(7 * Math.PI) / 6, Math.PI / 2, -Math.PI / 6];

	// Curves.easeInOut = cubic-bezier(0.42, 0, 0.58, 1).
	function easeInOut(t: number): number {
		const x = (u: number) => 3 * 0.42 * u * (1 - u) ** 2 + 3 * 0.58 * u ** 2 * (1 - u) + u ** 3;
		const y = (u: number) => 3 * u ** 2 * (1 - u) + u ** 3;
		let lo = 0;
		let hi = 1;
		for (let i = 0; i < 20; i++) {
			const mid = (lo + hi) / 2;
			if (x(mid) < t) lo = mid;
			else hi = mid;
		}
		return y((lo + hi) / 2);
	}

	/** Flutter's Interval(begin, end, curve: easeInOut). */
	function interval(t: number, begin: number, end: number): number {
		return easeInOut(Math.min(1, Math.max(0, (t - begin) / (end - begin))));
	}

	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
</script>

<script lang="ts">
	let {
		size = 50,
		color = 'var(--primary)',
		inline = false
	}: {
		/** Flutter's `size`: 50 for page loaders, 30 in buttons, 20 in pills. */
		size?: number;
		color?: string;
		/** Render just the animation, without the centered block around it. */
		inline?: boolean;
	} = $props();

	let t = $state(0);

	$effect(() => {
		let frame: number;
		const start = performance.now();
		const tick = (now: number) => {
			t = ((now - start) % DURATION) / DURATION;
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});

	// Flutter pads the box by 4%, so the stroke's center sits on 46% of the size.
	const center = $derived(size / 2);
	const radius = $derived(size * 0.46);
	const stroke = $derived(size * 0.08);

	const rotation = $derived(
		t <= 0.5
			? lerp(0, (4 * Math.PI) / 3, interval(t, 0, 0.5))
			: lerp((4 * Math.PI) / 3, 2 * Math.PI, interval(t, 0.5, 1))
	);
	const sweep = $derived(t <= 0.5 ? lerp(MAX, MIN, interval(t, 0, 0.4)) : lerp(MIN, MAX, interval(t, 0.5, 0.9)));

	function arc(start: number): string {
		const end = start + sweep;
		const x0 = center + radius * Math.cos(start);
		const y0 = center + radius * Math.sin(start);
		const x1 = center + radius * Math.cos(end);
		const y1 = center + radius * Math.sin(end);
		return `M ${x0} ${y0} A ${radius} ${radius} 0 0 1 ${x1} ${y1}`;
	}
</script>

{#snippet circle()}
	<svg
		class="loading"
		width={size}
		height={size}
		viewBox="0 0 {size} {size}"
		role="progressbar"
		aria-label="Loading"
	>
		<g
			transform="rotate({(rotation * 180) / Math.PI} {center} {center})"
			fill="none"
			stroke={color}
			stroke-width={stroke}
			stroke-linecap="round"
		>
			{#each STARTS as start (start)}
				<path d={arc(start)} />
			{/each}
		</g>
	</svg>
{/snippet}

{#if inline}
	{@render circle()}
{:else}
	<div class="block">{@render circle()}</div>
{/if}

<style>
	.loading {
		display: block;
		overflow: visible;
	}
	.block {
		display: flex;
		justify-content: center;
		padding: 20px 0;
	}
</style>
