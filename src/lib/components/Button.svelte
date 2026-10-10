<script lang="ts">
	import type { Snippet } from 'svelte';
	import Loading from './Loading.svelte';
	import { fade } from '#lib/motion.ts';

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
	<!-- The label and the spinner fade into each other. -->
	{#if loading}
		<span class="state" in:fade><Loading size={30} color="currentColor" inline /></span>
	{:else}
		<span class="state" in:fade>{@render children()}</span>
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
			var(--state-transition),
			box-shadow 200ms var(--ease-standard);
	}
	/* Like the landing page's buttons: instead of the state layer, they lift
	   with a soft primary shadow on hover and press back down. The shadow
	   always shows; the movement waits on reduced motion. Text buttons keep
	   the plain state layer. */
	.btn:not(.text)::after {
		display: none;
	}
	@media (hover: hover) {
		.btn:not(.text):not(:disabled):hover {
			box-shadow: 0 10px 20px -8px color-mix(in srgb, var(--primary) 70%, transparent);
		}
	}
	.btn:not(.text):active:not(:disabled) {
		box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--primary) 50%, transparent);
		transition-duration: 80ms;
	}
	@media (prefers-reduced-motion: no-preference) {
		@media (hover: hover) {
			.btn:not(.text):not(:disabled):hover {
				transform: translateY(-2px);
			}
		}
		.btn:active:not(:disabled) {
			transform: translateY(0) scale(0.97);
		}
	}
	.btn:disabled {
		opacity: 0.55;
		cursor: default;
	}
	.state {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
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
