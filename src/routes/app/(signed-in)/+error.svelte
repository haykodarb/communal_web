<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '#lib/components/Button.svelte';
	import FillCenter from '#lib/components/FillCenter.svelte';
	import { t } from '#lib/i18n.svelte.ts';

	// A page whose data couldn't load, shown inside the app's shell (the drawer
	// stays), centered like the loading animation.
	let retrying = $state(false);

	async function retry() {
		retrying = true;
		await invalidateAll();
		retrying = false;
	}
</script>

<FillCenter>
	<div class="error-page">
		<p class="message">
			{page.status === 404 ? t('This page does not exist.') : t(page.error?.message ?? '')}
		</p>
		{#if page.status !== 404}
			<Button variant="tonal" expand={false} loading={retrying} onclick={retry}>
				{t('Try again')}
			</Button>
		{/if}
	</div>
</FillCenter>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}
	.message {
		color: var(--error);
		line-height: 1.5;
	}
</style>
