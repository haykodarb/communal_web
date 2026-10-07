<script lang="ts" module>
	// Remembered across visits (and shared by every grid): the last container
	// width, and each item's measured height per column width. Coming back to a
	// list, the grid lays out at once at full height, so the scroll position and
	// the cover's return transition find items where they were, and nothing pops.
	const heightCache: Record<string, number> = $state({});
	let lastWidth = 0;
</script>

<script lang="ts" generics="T">
	import { untrack, type Snippet } from 'svelte';
	import { appear } from '#lib/motion.ts';

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

	let width = $state(lastWidth);
	// The width arrives from bind:clientWidth only after a resize observation, a
	// moment after mount; read it right away so the first layout already has the
	// right number of columns (e.g. when returning to a long list, where a
	// 2-column first pass would put items far from where they were).
	function measureNow(node: HTMLElement) {
		width = node.clientWidth;
	}
	$effect(() => {
		if (width > 0) lastWidth = width;
	});

	const count = $derived(
		Math.max(2, Math.min(columns, Math.floor((width + gap) / (minColumnWidth + gap)) || 2))
	);
	// Heights are only valid for the column width they were measured at.
	const columnWidth = $derived(Math.round((width - (count - 1) * gap) / count));
	const heightKey = (k: string) => `${columnWidth}:${k}`;

	// Measure the cells directly, right after the DOM updates: whenever the
	// column width or the items change, and when a cell resizes later (fonts,
	// text wrapping). Reading the sizes synchronously means the grid is fully
	// laid out before anything (scroll restoration, a page transition) looks.
	let grid: HTMLElement;
	function measureCells() {
		if (!grid || columnWidth <= 0) return;
		for (const cell of grid.children as HTMLCollectionOf<HTMLElement>) {
			// Keyed by the width the cell actually has: while the column count is
			// switching, the DOM can still be at the old width, and storing that
			// height under the new width would leave gaps in the layout.
			const hk = `${cell.offsetWidth}:${cell.dataset.key!}`;
			const height = cell.offsetHeight;
			if (heightCache[hk] !== height) heightCache[hk] = height;
		}
	}
	$effect(() => {
		void columnWidth;
		void items;
		void items.length;
		untrack(measureCells);
		if (!grid) return;
		const observer = new ResizeObserver(() => untrack(measureCells));
		for (const cell of grid.children) observer.observe(cell);
		return () => observer.disconnect();
	});

	const layout = $derived.by(() => {
		const bottoms = Array<number>(count).fill(0);
		const placed = new Map<string, { column: number; top: number }>();
		let total = 0;
		for (const it of items) {
			const k = key(it);
			const height = heightCache[heightKey(k)];
			if (height === undefined) continue;
			// The leftmost column no more than half a card (on average) taller than
			// the shortest. Cards then fill left to right, row by row, so the
			// left column gets any extra one and ends longest, then the next; a
			// column only catches up out of turn once it's clearly behind.
			const tie = placed.size ? total / placed.size / 2 : 0;
			const shortest = Math.min(...bottoms);
			const column = bottoms.findIndex((b) => b - shortest <= tie);
			placed.set(k, { column, top: bottoms[column] });
			bottoms[column] += height + gap;
			total += height;
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
	use:measureNow
	bind:this={grid}
>
	{#each items as it, i (key(it))}
		{@const k = key(it)}
		{@const spot = layout.placed.get(k)}
		<div
			class="cell"
			class:pending={!spot}
			in:appear={{ index: i % 20 }}
			style:--column={spot?.column ?? 0}
			style:top="{spot?.top ?? 0}px"
			data-key={k}
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
