<script lang="ts">
	let {
		tabs,
		index,
		onchange
	}: { tabs: string[]; index: number; onchange: (index: number) => void } = $props();
</script>

<div class="tabbar">
	<span
		class="pill"
		style="width: calc((100% - 10px) / {tabs.length}); transform: translateX({index * 100}%)"
	></span>
	{#each tabs as tab, i (tab)}
		<button
			class="tab"
			class:active={i === index}
			type="button"
			onclick={() => onchange(i)}
		>
			<span class="label">{tab}</span>
		</button>
	{/each}
</div>

<style>
	.tabbar {
		position: relative;
		display: flex;
		height: 70px;
		padding: 5px;
		border-radius: 50px;
		background: var(--surface-container);
	}
	.pill {
		position: absolute;
		top: 5px;
		left: 5px;
		height: calc(100% - 10px);
		border-radius: 50px;
		background: color-mix(in srgb, var(--primary) 15%, transparent);
		transition: transform 200ms ease;
	}
	.tab {
		position: relative;
		z-index: 1;
		flex: 1;
		border: none;
		background: none;
		color: var(--primary);
		font-weight: 600;
		font-size: 16px;
		cursor: pointer;
	}
	/* No hover or press layer (app.css): it would fight the sliding selection. */
	.tab:hover,
	.tab:active {
		box-shadow: none;
	}
	/* Hovering an unselected tab draws an underline under the label from left
	   to right; selecting it (the class change) draws it back to the left while
	   the pill slides over. */
	.label {
		position: relative;
	}
	.label::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -4px;
		height: 2px;
		border-radius: 1px;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 200ms var(--ease-standard);
	}
	@media (hover: hover) {
		.tab:not(.active):hover .label::after {
			transform: scaleX(1);
		}
	}
</style>
