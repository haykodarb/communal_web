<script lang="ts">
	let {
		size = 300,
		showWordmark = true
	}: { size?: number; showWordmark?: boolean } = $props();
</script>

<div class="logo">
	<span class="crow" style="--size: {size}px"></span>
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
