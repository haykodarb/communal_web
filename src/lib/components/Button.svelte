<script lang="ts">
	import type { Snippet } from 'svelte';
	import Loading from './Loading.svelte';

	type Variant = 'filled' | 'outlined' | 'tonal' | 'text';

	let {
		variant = 'filled',
		type = 'button',
		disabled = false,
		loading = false,
		expand = true,
		onclick,
		children
	}: {
		variant?: Variant;
		type?: 'button' | 'submit';
		disabled?: boolean;
		loading?: boolean;
		expand?: boolean;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	} = $props();
</script>

<button
	class="btn {variant}"
	class:expand
	{type}
	disabled={disabled || loading}
	onclick={onclick}
>
	{#if loading}
		<Loading size={30} color="currentColor" inline />
	{:else}
		{@render children()}
	{/if}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		height: 60px;
		padding: 0 20px;
		border-radius: 999px;
		border: 2px solid transparent;
		font-size: 20px;
		font-weight: 600;
		cursor: pointer;
		transition: var(--state-transition);
	}
	.btn:active:not(:disabled) {
		transform: scale(0.98);
	}
	.btn:disabled {
		opacity: 0.55;
		cursor: default;
	}
	.expand {
		width: 100%;
	}
	.filled {
		background: var(--primary);
		color: var(--on-primary);
	}
	.tonal {
		background: color-mix(in srgb, var(--primary) 15%, transparent);
		color: var(--primary);
	}
	.outlined {
		background: transparent;
		border-color: var(--primary);
		color: var(--primary);
	}
	.text {
		background: transparent;
		border: none;
		color: var(--secondary);
		height: auto;
		padding: 6px 8px;
		font-size: 16px;
	}
</style>
