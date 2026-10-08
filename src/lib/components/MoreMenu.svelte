<script lang="ts">
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n.svelte.ts';

	// A ⋮ button that opens a small menu of actions under it (right-aligned).
	// Picking an item, clicking anywhere else or pressing Escape closes it.
	let {
		items,
		size = 24
	}: {
		items: { label: string; onclick: () => void; danger?: boolean }[];
		size?: number;
	} = $props();

	let open = $state(false);
	let wrap: HTMLElement;
</script>

<svelte:window
	onclick={(event) => {
		if (open && !wrap.contains(event.target as Node)) open = false;
	}}
	onkeydown={(event) => {
		if (open && event.key === 'Escape') open = false;
	}}
/>

<div class="wrap" bind:this={wrap}>
	<button
		class="trigger"
		type="button"
		aria-label={t('More')}
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<Icon name="more" {size} />
	</button>
	{#if open}
		<div class="menu" role="menu">
			{#each items as item (item.label)}
				<button
					type="button"
					role="menuitem"
					class:danger={item.danger}
					onclick={() => {
						open = false;
						item.onclick();
					}}
				>
					{item.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.wrap {
		position: relative;
	}
	.trigger {
		display: flex;
		padding: 6px;
		border: none;
		border-radius: 50%;
		background: none;
		color: var(--on-surface);
		cursor: pointer;
	}
	.menu {
		position: absolute;
		right: 0;
		top: calc(100% + 4px);
		z-index: 20;
		min-width: 160px;
		padding: 6px 0;
		border-radius: 10px;
		background: var(--surface-container);
		box-shadow: 0 6px 18px color-mix(in srgb, var(--shadow) 45%, transparent);
		display: flex;
		flex-direction: column;
	}
	.menu button {
		padding: 10px 16px;
		border: none;
		background: none;
		color: var(--on-surface);
		font: inherit;
		font-size: 14px;
		text-align: left;
		white-space: nowrap;
		cursor: pointer;
	}
	.menu button.danger {
		color: var(--error);
	}
</style>
