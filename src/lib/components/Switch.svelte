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
	/* Instead of the shared state layer (app.css), hovering puts a halo around
	   the knob (which grows a hair); pressing strengthens it. Keyboard focus
	   shows the halo too. */
	.switch:hover,
	.switch:active {
		box-shadow: none;
	}
	.switch:focus-visible {
		outline: none;
	}
	.knob {
		--x: 0px;
		--scale: 1;
		--halo: 0px;
		--halo-strength: 15%;
		position: absolute;
		top: 10px;
		left: 10px;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--primary);
		transform: translateX(var(--x)) scale(var(--scale));
		box-shadow: 0 0 0 var(--halo)
			color-mix(in srgb, var(--primary) var(--halo-strength), transparent);
		transition:
			transform 200ms ease,
			box-shadow 150ms ease;
	}
	.knob.right {
		--x: 40px;
	}
	@media (hover: hover) {
		.switch:hover .knob {
			--scale: 1.04;
			--halo: 6px;
		}
	}
	.switch:focus-visible .knob {
		--halo: 6px;
	}
	.switch:active .knob {
		--halo: 8px;
		--halo-strength: 25%;
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
