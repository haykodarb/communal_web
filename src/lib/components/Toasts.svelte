<script lang="ts">
	import { fly } from '#lib/motion.ts';
	import { toast } from '#lib/toast.svelte.ts';

	// Rendered once in the root layout. Bottom-centred, clear of the Fab and the
	// mobile safe area; an error toast gets its own assertive live region so it
	// interrupts, while info toasts share a polite one.
</script>

<div class="toasts">
	<div class="region" aria-live="polite">
		{#each toast.items.filter((item) => item.kind === 'info') as item (item.id)}
			<button
				type="button"
				class="toast"
				in:fly={{ y: 16 }}
				out:fly={{ y: 16 }}
				onclick={() => toast.dismiss(item.id)}
			>
				{item.message}
			</button>
		{/each}
	</div>
	<div class="region" aria-live="assertive">
		{#each toast.items.filter((item) => item.kind === 'error') as item (item.id)}
			<button
				type="button"
				class="toast error"
				in:fly={{ y: 16 }}
				out:fly={{ y: 16 }}
				onclick={() => toast.dismiss(item.id)}
			>
				{item.message}
			</button>
		{/each}
	</div>
</div>

<style>
	.toasts {
		position: fixed;
		left: 50%;
		bottom: calc(24px + env(safe-area-inset-bottom));
		transform: translateX(-50%);
		z-index: 40;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		width: min(420px, calc(100% - 32px));
		pointer-events: none;
	}
	.region {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
	.toast {
		pointer-events: auto;
		max-width: 100%;
		padding: 12px 22px;
		border: none;
		border-radius: 999px;
		background: var(--on-surface);
		color: var(--surface);
		font-size: 14px;
		font-weight: 500;
		text-align: center;
		line-height: 1.3;
		box-shadow: 0 4px 16px color-mix(in srgb, var(--shadow) 60%, transparent);
		cursor: pointer;
	}
	.toast.error {
		background: var(--error);
		color: var(--on-primary);
	}
</style>
