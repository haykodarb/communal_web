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
	.slot {
		position: sticky;
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
</style>
