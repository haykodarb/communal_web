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
	<button type="submit" class="send" aria-label={t('Send')} disabled={!value.trim()}>
		<Icon name="send" size={20} />
	</button>
</form>

<style>
	.composer {
		display: flex;
		align-items: flex-end;
		gap: 10px;
		padding: 12px 20px 20px;
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
		line-height: 1.4;
		resize: none;
		field-sizing: content;
		outline: none;
	}
	textarea:focus {
		border-color: var(--primary);
	}
	.send {
		display: flex;
		padding: 14px;
		border: none;
		border-radius: 50%;
		background: var(--primary);
		color: var(--on-primary);
		cursor: pointer;
	}
	.send:disabled {
		opacity: 0.5;
		cursor: default;
	}
</style>
