<script lang="ts">
	import type { Snippet } from 'svelte';
	import { afterExitAnimation } from '#lib/motion.ts';

	// CommonFilterBottomsheet: a modal sheet sliding up from the bottom of the
	// content column. Open with bind:this + open(); closes on backdrop click/Esc.
	let { children }: { children: Snippet } = $props();

	let dialog: HTMLDialogElement;

	export function open() {
		// Flutter shows the sheet inside the page's Scaffold, i.e. across the
		// content column; on mobile that is the full width.
		const column = document.querySelector('.content-col')?.getBoundingClientRect();
		dialog.style.marginLeft = column ? `${column.left}px` : 'auto';
		dialog.style.width = column ? `${column.width}px` : '100vw';
		dialog.showModal();
		// showModal() focuses the first chip; Flutter's sheet opens unfocused.
		(document.activeElement as HTMLElement | null)?.blur();
	}

	// Slides back down, then closes.
	function close() {
		afterExitAnimation(dialog, 'closing', () => dialog.close());
	}
</script>

<dialog
	bind:this={dialog}
	onclick={(event) => {
		if (event.target === dialog) close();
	}}
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
>
	<div class="sheet">{@render children()}</div>
</dialog>

<style>
	dialog {
		max-width: 100vw;
		margin: auto auto 0;
		padding: 0;
		border: none;
		border-radius: 28px 28px 0 0;
		background: var(--surface-container);
		color: var(--on-surface);
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.4);
	}
	/* Slides up from the bottom while the backdrop fades in; reversed on close. */
	dialog[open] {
		animation: sheet-in 260ms var(--ease-standard);
	}
	dialog[open]::backdrop {
		animation: backdrop-in 200ms ease;
	}
	dialog:global(.closing) {
		animation: sheet-out 200ms ease-in forwards;
	}
	dialog:global(.closing)::backdrop {
		animation: backdrop-out 200ms ease-in forwards;
	}
	@keyframes sheet-in {
		from {
			transform: translateY(100%);
		}
	}
	@keyframes sheet-out {
		to {
			transform: translateY(100%);
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
	.sheet {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 30px;
	}
</style>
