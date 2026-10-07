<script lang="ts">
	import Button from './Button.svelte';
	import { t } from '#lib/i18n.svelte.ts';
	import { afterExitAnimation } from '#lib/motion.ts';

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

	// Answers right away (the caller can start its work) while the dialog plays
	// its exit animation, then actually closes.
	function close(result: boolean) {
		resolve?.(result);
		resolve = null;
		afterExitAnimation(dialog, 'closing', () => dialog.close());
	}
</script>

<dialog
	bind:this={dialog}
	oncancel={(event) => {
		event.preventDefault();
		close(false);
	}}
>
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
	/* Scales up a little while the backdrop fades in; reversed on close. */
	dialog[open] {
		animation: dialog-in 180ms var(--ease-standard);
	}
	dialog[open]::backdrop {
		animation: backdrop-in 180ms ease;
	}
	dialog:global(.closing) {
		animation: dialog-out 140ms ease-in forwards;
	}
	dialog:global(.closing)::backdrop {
		animation: backdrop-out 140ms ease-in forwards;
	}
	@keyframes dialog-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
	}
	@keyframes dialog-out {
		to {
			opacity: 0;
			transform: scale(0.95);
		}
	}
	@keyframes backdrop-in {
		from {
			opacity: 0;
		}
	}
	@keyframes backdrop-out {
		to {
			opacity: 0;
		}
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
