<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		label,
		value = $bindable(''),
		type = 'text',
		error = '',
		autocomplete,
		oninput,
		onsubmit
	}: {
		label: string;
		value?: string;
		type?: 'text' | 'email' | 'password';
		error?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		oninput?: () => void;
		onsubmit?: () => void;
	} = $props();
</script>

<label class="field">
	<input
		{type}
		bind:value
		{autocomplete}
		placeholder={label}
		aria-label={label}
		class:error={error.length > 0}
		oninput={oninput}
		onkeydown={(event) => {
			if (event.key === 'Enter' && onsubmit) {
				event.preventDefault();
				onsubmit();
			}
		}}
	/>
	{#if error}
		<span class="error-text">{error}</span>
	{/if}
</label>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
	}
	/* Matches the Flutter InputDecorationTheme: filled, borderless, rounded. */
	input {
		height: 60px;
		padding: 0 20px;
		border-radius: 10px;
		border: 2px solid transparent;
		background: var(--surface-container);
		color: var(--on-surface);
		font-size: 16px;
		outline: none;
		transition: border-color 150ms ease;
	}
	input::placeholder {
		color: var(--on-surface-variant);
		font-size: 14px;
	}
	input:focus {
		border-color: var(--primary);
	}
	input.error {
		border-color: var(--error);
	}
	.error-text {
		font-size: 13px;
		color: var(--error);
		padding-left: 4px;
	}
</style>
