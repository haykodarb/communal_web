<script lang="ts">
	import Button from './Button.svelte';
	import { t } from '#lib/i18n.svelte.ts';

	// Mirrors CommonConfirmationDialog. Open with `bind:this` + `confirm()`,
	// which resolves to true when the user picks the confirm button.
	let {
		title,
		confirmText = 'Yes',
		cancelText = 'No'
	}: { title: string; confirmText?: string; cancelText?: string } = $props();

	let dialog: HTMLDialogElement;
	let resolve: ((value: boolean) => void) | null = null;

	export function confirm(): Promise<boolean> {
		dialog.showModal();
		return new Promise((r) => (resolve = r));
	}

	function close(result: boolean) {
		dialog.close();
		resolve?.(result);
		resolve = null;
	}
</script>

<dialog bind:this={dialog} oncancel={() => close(false)}>
	<p class="title">{title}</p>
	<div class="actions">
		<Button onclick={() => close(true)}>{t(confirmText)}</Button>
		<Button variant="tonal" onclick={() => close(false)}>{t(cancelText)}</Button>
	</div>
</dialog>

<style>
	dialog {
		width: min(400px, calc(100vw - 32px));
		margin: auto;
		padding: 30px;
		border-radius: 20px;
		border: 0.5px solid var(--primary);
		background: var(--surface);
		color: var(--on-surface);
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.4);
	}
	.title {
		margin: 20px 0 40px;
		text-align: center;
		font-size: 20px;
	}
	.actions {
		display: flex;
		gap: 20px;
	}
</style>
