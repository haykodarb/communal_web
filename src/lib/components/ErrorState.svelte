<script lang="ts">
	import Icon from './Icon.svelte';
	import Button from './Button.svelte';
	import { t } from '#lib/i18n.svelte.ts';

	// A centered placeholder for a list that failed to load: an error-tinted
	// icon, the message (announced at once) and, when there's a way back in, a
	// "Try again" button.
	let { message, onretry }: { message: string; onretry?: () => void } = $props();
</script>

<div class="error-state">
	<span class="icon"><Icon name="x" size={24} /></span>
	<p class="message" role="alert">{message}</p>
	{#if onretry}
		<Button variant="tonal" expand={false} onclick={onretry}>{t('Try again')}</Button>
	{/if}
</div>

<style>
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 20px;
		text-align: center;
	}
	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--error) 15%, transparent);
		color: var(--error);
	}
	.message {
		font-size: 14px;
		line-height: 1.4;
		color: var(--error);
	}
</style>
