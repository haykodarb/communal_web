<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		value,
		onchange,
		ariaLabel,
		left,
		right
	}: {
		value: boolean;
		onchange: () => void;
		ariaLabel: string;
		left: Snippet;
		right: Snippet;
	} = $props();
</script>

<button
	type="button"
	class="switch"
	aria-label={ariaLabel}
	aria-pressed={value}
	onclick={onchange}
>
	<span class="knob" class:right={!value}></span>
	<span class="opt" class:active={value}>{@render left()}</span>
	<span class="opt" class:active={!value}>{@render right()}</span>
</button>

<style>
	.switch {
		position: relative;
		width: 100px;
		height: 60px;
		padding: 10px;
		border-radius: 999px;
		border: none;
		background: var(--surface-container);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.knob {
		position: absolute;
		top: 10px;
		left: 10px;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--primary);
		transition: transform 200ms ease;
	}
	.knob.right {
		transform: translateX(40px);
	}
	.opt {
		position: relative;
		z-index: 1;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		font-weight: 600;
		color: var(--primary);
		transition: color 200ms ease;
	}
	.opt.active {
		color: var(--on-primary);
	}
</style>
