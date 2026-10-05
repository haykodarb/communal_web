<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { t } from '#lib/i18n.svelte.ts';
</script>

<div class="container">
	<h1>{t('Notifications')}</h1>
	<div class="empty">
		<Icon name="bell" size={40} />
		<p>{t('No notifications yet.')}</p>
	</div>
</div>

<style>
	h1 {
		font-size: 32px;
		font-weight: 800;
		margin-bottom: 20px;
	}
	.empty {
		margin-top: 50px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		color: var(--on-surface-variant);
	}
</style>
