<script lang="ts">
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n.svelte.ts';

	// Growing message box + send button for chats and discussion threads.
	// Enter sends, Shift+Enter adds a line.
	let { value = $bindable(''), onsend }: { value?: string; onsend: () => void } = $props();

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onsend();
		}
	}
</script>

<form
	class="composer"
	onsubmit={(event) => {
		event.preventDefault();
		onsend();
	}}
>
	<textarea
		bind:value
		rows="1"
		placeholder={t('Type something...')}
		aria-label={t('Type something...')}
		{onkeydown}
	></textarea>
	<button type="submit" class="send" aria-label={t('Send')}>
		<Icon name="send" size={20} />
	</button>
</form>

<style>
	.composer {
		display: flex;
		align-items: flex-end;
		gap: 6px;
		padding: 10px;
	}
	textarea {
		flex: 1;
		max-height: 9em;
		padding: 14px 20px;
		border: 2px solid transparent;
		border-radius: 30px;
		background: var(--surface-container);
		color: var(--on-surface);
		font: inherit;
		font-size: 14px;
		/* One line is 52px (20 + 2 × 14 padding + 2 × 2 border), the send
		   button's size. */
		line-height: 20px;
		resize: none;
		field-sizing: content;
		outline: none;
		/* Focus fades in like TextField's. */
		transition: border-color 300ms ease;
	}
	textarea:focus {
		border-color: var(--primary);
	}
	.send {
		flex: 0 0 52px;
		height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: var(--primary);
		color: var(--on-primary);
		cursor: pointer;
	}
</style>
