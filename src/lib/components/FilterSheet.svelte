<script lang="ts">
	import type { Snippet } from 'svelte';

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

	export function close() {
		dialog.close();
	}
</script>

<dialog
	bind:this={dialog}
	onclick={(event) => {
		if (event.target === dialog) dialog.close();
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
	.sheet {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 30px;
	}
</style>
