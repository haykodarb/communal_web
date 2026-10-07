<script lang="ts">
	import UserLink from './UserLink.svelte';
	import type { Profile } from '#lib/data/models.ts';
	import { i18n } from '#lib/i18n.svelte.ts';

	// One review in the book page's list: author, optional date and the text,
	// collapsed to 4 lines and expanded on click (`plain` is the book owner's own
	// review, which has no card background and no date).
	let {
		author,
		text,
		date = null,
		plain = false
	}: { author: Profile; text: string; date?: string | null; plain?: boolean } = $props();

	let expanded = $state(false);

	const dateText = $derived(
		date
			? new Intl.DateTimeFormat(i18n.locale === 'es' ? 'es-ES' : 'en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric'
				}).format(new Date(date))
			: ''
	);
</script>

<article class="review" class:plain>
	<div class="head">
		<UserLink profile={author} size={30} />
		{#if dateText}<time class="date">{dateText}</time>{/if}
	</div>
	<button
		class="text"
		class:expanded
		type="button"
		aria-expanded={expanded}
		onclick={() => (expanded = !expanded)}
	>
		{text}
	</button>
</article>

<style>
	.review {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.review.plain {
		padding: 0;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		/* The reviewer's name (UserLink). */
		font-size: 14px;
	}
	.date {
		flex: 0 0 auto;
		font-size: 13px;
		font-style: italic;
		color: var(--on-surface-variant);
	}
	.text {
		margin: 0;
		padding: 0;
		border: none;
		background: none;
		font: inherit;
		font-size: 14px;
		line-height: 1.5;
		text-align: left;
		white-space: pre-line;
		color: inherit;
		cursor: pointer;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.text.expanded {
		display: block;
		overflow: visible;
	}
</style>
