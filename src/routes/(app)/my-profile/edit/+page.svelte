<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '#lib/components/Icon.svelte';
	import { t } from '#lib/i18n.svelte.ts';
</script>

<div class="page">
	<button class="back" type="button" aria-label={t('Back')} onclick={() => goto('/my-profile')}>
		<Icon name="chevron-left" size={32} />
	</button>
	<h1>{t('Edit profile')}</h1>
	<p class="muted">{t('This form has not been ported yet.')}</p>
</div>

<style>
	.page {
		padding: 16px 20px 40px;
	}
	.back {
		background: none;
		border: none;
		color: var(--on-surface);
		cursor: pointer;
		padding: 0;
		margin-bottom: 12px;
	}
	h1 {
		font-size: 32px;
		font-weight: 800;
	}
	.muted {
		margin-top: 12px;
		color: var(--on-surface-variant);
	}
</style>
