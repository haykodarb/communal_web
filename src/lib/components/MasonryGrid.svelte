<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	// Flutter's SliverMasonryGrid.count (CommonGridView: 2 columns, 8px
	// spacing): each item goes, in order, into whichever column is shorter so
	// far, so the columns don't line up row by row. Items are positioned from
	// their measured heights; one that hasn't been measured yet stays hidden
	// until it has, so it never shows up in the wrong place. Appending items
	// (infinite scroll) leaves the ones already placed where they are.
	//
	// `columns` above 2 is an upper bound: the grid uses as many as fit at
	// `minColumnWidth` each, but never fewer than 2.
	let {
		items,
		key,
		gap = 8,
		columns = 2,
		minColumnWidth = 140,
		item
	}: {
		items: T[];
		key: (item: T) => string;
		gap?: number;
		columns?: number;
		minColumnWidth?: number;
		item: Snippet<[T]>;
	} = $props();

	let width = $state(0);
	let heights = $state<Record<string, number>>({});

	const count = $derived(
		Math.max(2, Math.min(columns, Math.floor((width + gap) / (minColumnWidth + gap)) || 2))
	);

	const layout = $derived.by(() => {
		const bottoms = Array<number>(count).fill(0);
		const placed = new Map<string, { column: number; top: number }>();
		for (const it of items) {
			const k = key(it);
			const height = heights[k];
			if (height === undefined) continue;
			// The shortest column; ties go to the leftmost, as in Flutter.
			const column = bottoms.indexOf(Math.min(...bottoms));
			placed.set(k, { column, top: bottoms[column] });
			bottoms[column] += height + gap;
		}
		return { placed, height: Math.max(0, ...bottoms.map((b) => b - gap)) };
	});
</script>

<div
	class="masonry"
	style:height="{layout.height}px"
	style:--gap="{gap}px"
	style:--count={count}
	bind:clientWidth={width}
>
	{#each items as it (key(it))}
		{@const k = key(it)}
		{@const spot = layout.placed.get(k)}
		<div
			class="cell"
			class:pending={!spot}
			style:--column={spot?.column ?? 0}
			style:top="{spot?.top ?? 0}px"
			bind:clientHeight={heights[k]}
		>
			{@render item(it)}
		</div>
	{/each}
</div>

<style>
	.masonry {
		position: relative;
		/* One column's width. */
		--column-width: calc((100% - (var(--count) - 1) * var(--gap)) / var(--count));
	}
	.cell {
		position: absolute;
		width: var(--column-width);
		left: calc(var(--column) * (var(--column-width) + var(--gap)));
	}
	.cell.pending {
		visibility: hidden;
	}
</style>
