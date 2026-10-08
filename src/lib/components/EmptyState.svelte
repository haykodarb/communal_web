<script lang="ts">
	import Icon from './Icon.svelte';

	// A centered placeholder for an empty list: a muted icon, a title, an
	// optional secondary line, and an optional action - either a link (href) or
	// a callback (onaction), styled like the app's filled pill buttons.
	let {
		icon,
		title,
		text,
		actionLabel,
		actionIcon,
		href,
		onaction
	}: {
		icon?: string;
		title: string;
		text?: string;
		actionLabel?: string;
		actionIcon?: string;
		href?: string;
		onaction?: () => void;
	} = $props();
</script>

<div class="empty-state">
	{#if icon}<Icon name={icon} size={40} />{/if}
	<p class="title">{title}</p>
	{#if text}<p class="text">{text}</p>{/if}
	{#if actionLabel && href}
		<a class="action" {href}>
			{#if actionIcon}<Icon name={actionIcon} size={16} />{/if}
			<span>{actionLabel}</span>
		</a>
	{:else if actionLabel && onaction}
		<button type="button" class="action" onclick={onaction}>
			{#if actionIcon}<Icon name={actionIcon} size={16} />{/if}
			<span>{actionLabel}</span>
		</button>
	{/if}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 40px 20px;
		text-align: center;
		color: var(--on-surface-variant);
	}
	/* A "\n" in the title starts a new line. */
	.title {
		font-size: 14px;
		line-height: 1.4;
		white-space: pre-line;
	}
	.text {
		margin-top: -4px;
		font-size: 13px;
		line-height: 1.4;
	}
	.action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		height: 35px;
		margin-top: 6px;
		padding: 0 16px;
		border: none;
		border-radius: 999px;
		background: var(--primary);
		color: var(--on-primary);
		font-size: 12px;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
	}
	.action:active {
		transform: scale(0.95);
	}
</style>
