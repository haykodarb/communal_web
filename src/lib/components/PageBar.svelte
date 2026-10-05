<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n.svelte.ts';

	// The app's AppBar (light_theme.dart: centered 18px/600 title, 30px icons):
	// back button, centered title and optional trailing actions.
	let {
		title,
		mobileTitle = false,
		onback,
		actions
	}: {
		title: string;
		/** Only show the title on mobile, like Flutter's `Responsive.isMobile(context) ? Text(...) : null`. */
		mobileTitle?: boolean;
		onback: () => void;
		actions?: Snippet;
	} = $props();
</script>

<header class="bar">
	<button class="icon-btn" type="button" aria-label={t('Back')} onclick={onback}>
		<Icon name="chevron-left" size={30} />
	</button>
	<h1 class:mobile-only={mobileTitle}>{title}</h1>
	<div class="actions">{@render actions?.()}</div>
</header>

<style>
	.bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		height: 56px;
		padding: 0 8px;
	}
	h1 {
		min-width: 0;
		font-size: 18px;
		font-weight: 600;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	@media (min-width: 800px) {
		h1.mobile-only {
			visibility: hidden;
		}
	}
	.icon-btn {
		justify-self: start;
		display: flex;
		padding: 4px;
		border: none;
		background: none;
		color: var(--on-surface);
		cursor: pointer;
	}
	.actions {
		justify-self: end;
		display: flex;
		align-items: center;
	}
</style>
