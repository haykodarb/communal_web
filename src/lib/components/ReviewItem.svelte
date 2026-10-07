<script lang="ts">
	import UserLink from './UserLink.svelte';
	import type { Profile } from '#lib/data/models.ts';
	import { i18n } from '#lib/i18n.svelte.ts';

	// One review in the book page's list: author, optional date and the text,
	// collapsed to 4 lines. Only a review that's actually cut off can be
	// expanded (and shows a pointer); short ones are plain text. `tag` shows a
	// small label in place of the date, saying what the review is ("Owner's
	// note", "Your review").
	let {
		author,
		text,
		date = null,
		tag = null,
		showAuthor = true
	}: {
		author: Profile;
		text: string;
		date?: string | null;
		tag?: string | null;
		/** Off where the reviewer is already clear from the page (the loan card). */
		showAuthor?: boolean;
	} = $props();

	let expanded = $state(false);

	// Whether the collapsed text is cut off; re-checked when the width changes
	// (text rewraps). Once expanded it stays expandable so it can collapse.
	let textEl: HTMLElement;
	let clipped = $state(false);
	$effect(() => {
		void text;
		const measure = () => {
			if (!expanded) clipped = textEl.scrollHeight > textEl.clientHeight + 1;
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(textEl);
		return () => observer.disconnect();
	});
	const expandable = $derived(clipped || expanded);

	// The text is a paragraph (selectable; a button's text isn't). A click
	// toggles it, unless it ended a text selection; Enter and Space do too.
	function toggle() {
		if (!expandable || window.getSelection()?.toString()) return;
		expanded = !expanded;
	}
	function onKeydown(event: KeyboardEvent) {
		if (expandable && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			expanded = !expanded;
		}
	}

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

<article class="review">
	<div class="head">
		{#if showAuthor}<UserLink profile={author} size={30} />{/if}
		{#if tag}
			<span class="tag">{tag}</span>
		{:else if dateText}
			<time class="date">{dateText}</time>
		{/if}
	</div>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<p
		bind:this={textEl}
		class="text"
		class:expanded
		class:expandable
		role={expandable ? 'button' : undefined}
		tabindex={expandable ? 0 : undefined}
		aria-expanded={expandable ? expanded : undefined}
		onclick={toggle}
		onkeydown={onKeydown}
	>
		{text}
	</p>
</article>

<style>
	.review {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		/* The reviewer's name (UserLink). */
		font-size: 14px;
	}
	.tag {
		flex: 0 0 auto;
		padding: 2px 8px;
		border-radius: 10px;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--tertiary);
		background: color-mix(in srgb, var(--tertiary) 14%, transparent);
	}
	.date {
		flex: 0 0 auto;
		font-size: 13px;
		font-style: italic;
		color: var(--on-surface-variant);
	}
	.text {
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
		white-space: pre-line;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.text.expandable {
		cursor: pointer;
	}
	.text.expanded {
		display: block;
		overflow: visible;
	}
</style>
