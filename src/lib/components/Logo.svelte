<script lang="ts">
	let {
		size = 300,
		showWordmark = true
	}: {
		/** Pixel size, or 'fill' to take the parent's free space (Flutter's Expanded crow). */
		size?: number | 'fill';
		showWordmark?: boolean;
	} = $props();
</script>

<div class="logo" class:fill={size === 'fill'}>
	<span class="crow" style:--size={size === 'fill' ? undefined : `${size}px`}></span>
	{#if showWordmark}
		<span class="wordmark logo-gradient">Communal</span>
	{/if}
</div>

<style>
	.logo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}
	.logo.fill {
		height: 100%;
	}
	.fill .crow {
		flex: 1;
		min-height: 0;
		width: 100%;
		height: auto;
	}
	.crow {
		display: inline-block;
		width: var(--size);
		height: var(--size);
		background: linear-gradient(135deg, var(--primary), var(--tertiary));
		-webkit-mask: url('/crow.svg') center / contain no-repeat;
		mask: url('/crow.svg') center / contain no-repeat;
	}
	.wordmark {
		font-size: 40px;
		font-weight: 800;
		letter-spacing: 0.5px;
	}
</style>
