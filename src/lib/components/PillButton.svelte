<script lang="ts">
	import Icon from './Icon.svelte';
	import Loading from './Loading.svelte';

	// The small rounded buttons in the profile header (edit, friendship, message).
	let {
		icon,
		label,
		filled = false,
		loading = false,
		onclick
	}: {
		icon: string;
		label?: string;
		filled?: boolean;
		loading?: boolean;
		onclick: () => void;
	} = $props();
</script>

<button
	class="pill"
	class:filled
	class:icon-only={!label}
	type="button"
	aria-label={label ? undefined : icon}
	disabled={loading}
	{onclick}
>
	{#if loading}
		<Loading size={20} color="currentColor" inline />
	{:else}
		<Icon name={icon} size={16} />
		{#if label}<span>{label}</span>{/if}
	{/if}
</button>

<style>
	.pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		height: 35px;
		min-width: 35px;
		padding: 0 12px;
		border: 1.5px solid var(--primary);
		border-radius: 999px;
		background: none;
		color: var(--primary);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
	}
	.pill.filled {
		background: var(--primary);
		color: var(--on-primary);
	}
	.pill:active:not(:disabled) {
		transform: scale(0.95);
	}
	.pill.icon-only {
		padding: 0;
	}
	.pill:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
