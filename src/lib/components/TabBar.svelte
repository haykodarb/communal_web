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
			{tab}
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
</style>
