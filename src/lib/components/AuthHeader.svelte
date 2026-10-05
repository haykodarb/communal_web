<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n.svelte.ts';

	// Back chevron + large title used by the auth sub-pages.
	let { title, back }: { title: string; back: string } = $props();
</script>

<div class="header">
	<button class="back" type="button" aria-label={t('Back')} onclick={() => goto(back)}>
		<Icon name="chevron-left" size={32} />
	</button>
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
	.back {
		display: inline-flex;
		background: none;
		border: none;
		color: var(--on-surface);
		cursor: pointer;
		padding: 0;
	}
</style>
