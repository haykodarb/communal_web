<script lang="ts">
	import BackButton from './BackButton.svelte';

	// Back chevron + large title used by the auth sub-pages.
	let { title }: { title: string } = $props();
</script>

<div class="header">
	<BackButton size={32} menu={false} to="/auth" />
	<h1>{title}</h1>
</div>

<style>
	.header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 40px;
	}
	h1 {
		font-size: 40px;
		font-weight: 800;
	}
</style>
