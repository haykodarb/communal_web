<script lang="ts">
	import Icon from './Icon.svelte';

	// Floating action button pinned to the bottom-right of the content column
	// (sticky rather than fixed, so it stays inside the column on desktop).
	let {
		icon,
		label,
		bottom = 24,
		onclick
	}: { icon: string; label: string; /** Distance from the bottom edge, in px. */ bottom?: number; onclick: () => void } =
		$props();
</script>

<div class="slot" style:bottom="{bottom}px">
	<button class="fab" type="button" aria-label={label} {onclick}>
		<Icon name={icon} size={28} />
	</button>
</div>

<style>
	/* margin-top: auto pins it to the bottom of a short page when the parent is a
	   full-height flex column. */
	.slot {
		position: sticky;
		margin-top: auto;
		bottom: 24px;
		display: flex;
		justify-content: flex-end;
		padding-right: 24px;
		pointer-events: none;
		z-index: 15;
	}
	.fab {
		pointer-events: auto;
		width: 56px;
		height: 56px;
		border: none;
		border-radius: 20px;
		background: var(--primary);
		color: var(--on-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 4px 12px color-mix(in srgb, var(--shadow) 60%, transparent);
	}
	/* Its drop shadow plus the shared state layer (app.css), which its own
	   box-shadow would otherwise replace; it lifts a little on hover. */
	@media (hover: hover) {
		.fab:hover {
			transform: translateY(-1px);
			box-shadow:
				0 6px 16px color-mix(in srgb, var(--shadow) 70%, transparent),
				inset 0 0 0 100vmax color-mix(in srgb, currentColor var(--state-hover), transparent);
		}
	}
	.fab:active {
		transform: scale(0.95);
		box-shadow:
			0 2px 8px color-mix(in srgb, var(--shadow) 60%, transparent),
			inset 0 0 0 100vmax color-mix(in srgb, currentColor var(--state-press), transparent);
	}
</style>
