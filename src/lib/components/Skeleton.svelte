<script lang="ts">
	// Placeholder shapes shown while a list's first page loads, in place of the
	// centered spinner: grey blocks shaped like the cards that will arrive, with
	// a soft shimmer (still under reduced motion). Render it inside the list's
	// own container so the spacing matches the real items.
	//   book:  BookCard (My Books)        loan: LoanCard / ReviewCard
	//   row:   an avatar and a line (Friends, Search users, Notifications)
	//   grid:  VerticalBookCards in up to 3 columns (Home, Search)
	let { kind, count = 4 }: { kind: 'book' | 'loan' | 'row' | 'grid'; count?: number } = $props();

	// Vary the line lengths so the placeholder doesn't look like a stamp.
	const widths = ['70%', '55%', '80%', '60%', '75%', '50%'];
</script>

{#snippet line(width: string, height = 12)}
	<span class="block" style:width style:height="{height}px"></span>
{/snippet}

<div class="skeleton {kind}" aria-busy="true" aria-label="Loading">
	{#each Array.from({ length: count }, (_, i) => i) as i (i)}
		{#if kind === 'book'}
			<div class="card book-card">
				<span class="block book-cover"></span>
				<div class="lines">
					{@render line(widths[i % widths.length], 14)}
					{@render line('40%')}
				</div>
			</div>
		{:else if kind === 'loan'}
			<div class="card loan-card">
				<div class="lines">
					{@render line(widths[i % widths.length], 14)}
					{@render line('40%')}
					<span class="gap"></span>
					{@render line('55%')}
					{@render line('35%')}
				</div>
				<span class="block loan-cover"></span>
			</div>
		{:else if kind === 'row'}
			<div class="card user-row">
				<span class="block avatar"></span>
				{@render line(widths[i % widths.length], 14)}
			</div>
		{:else}
			<div class="card tile">
				<span class="block tile-cover"></span>
				{@render line(widths[i % widths.length])}
				{@render line('45%', 10)}
			</div>
		{/if}
	{/each}
</div>

<style>
	.skeleton {
		display: flex;
		flex-direction: column;
		gap: inherit;
	}
	/* Like MasonryGrid with 3 columns: as many as fit at 140px or more, but
	   never more than 3 (each at least a third of the width). */
	.skeleton.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(max(140px, (100% - 16px) / 3), 1fr));
		gap: 8px;
	}
	.card {
		border-radius: 10px;
		background: var(--surface-container);
	}
	.block {
		display: block;
		border-radius: 5px;
		background: linear-gradient(
				100deg,
				transparent 30%,
				color-mix(in srgb, var(--surface-container) 70%, transparent) 50%,
				transparent 70%
			)
			var(--surface-tint, color-mix(in srgb, var(--on-surface) 9%, transparent));
		background-size: 200% 100%;
		animation: shimmer 1.4s ease-in-out infinite;
	}
	@keyframes shimmer {
		from {
			background-position: 150% 0;
		}
		to {
			background-position: -50% 0;
		}
	}
	.lines {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.gap {
		height: 12px;
	}
	/* BookCard: a 150px cover on the left, 200px tall. */
	.book-card {
		display: flex;
		gap: 15px;
		height: 200px;
		overflow: hidden;
	}
	.book-card .lines {
		padding: 20px 15px 0 0;
	}
	.book-cover {
		width: 150px;
		height: 100%;
		border-radius: 0;
	}
	/* LoanCard / ReviewCard: 20px padding, a 96x128 cover on the right. */
	.loan-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 20px;
	}
	.loan-cover {
		width: 96px;
		height: 128px;
		flex: 0 0 96px;
	}
	/* UserRow: a 44px avatar and the name. */
	.user-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 10px;
	}
	.avatar {
		width: 44px;
		height: 44px;
		flex: 0 0 44px;
		border-radius: 50%;
	}
	/* VerticalBookCard: a 3:4 cover and two centered lines. */
	.tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 10px;
	}
	.tile-cover {
		width: 100%;
		aspect-ratio: 3 / 4;
	}
</style>
