<script lang="ts">
	import { page } from '$app/state';
	import FillCenter from '#lib/components/FillCenter.svelte';
	import { t } from '#lib/i18n.svelte.ts';

	// Errors outside the app (e.g. a URL that doesn't exist), centered like the
	// app's own error and loading states.
</script>

<FillCenter>
	<div class="error-page">
		<p class="message">
			{page.status === 404 ? t('This page does not exist.') : t(page.error?.message ?? '')}
		</p>
		<a href="/">{t('Go to the home page')}</a>
	</div>
</FillCenter>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}
	.message {
		color: var(--on-surface);
		line-height: 1.5;
	}
	a {
		color: var(--primary);
		font-weight: 600;
	}
</style>
