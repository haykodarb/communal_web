<script lang="ts">
	import type { Snippet } from 'svelte';

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
		<span class="spinner" aria-hidden="true"></span>
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
		transition:
			opacity 150ms ease,
			background-color 150ms ease,
			transform 100ms ease;
	}
	.btn:active:not(:disabled) {
		transform: scale(0.99);
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
	.spinner {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2.5px solid currentColor;
		border-top-color: transparent;
		animation: spin 700ms linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
