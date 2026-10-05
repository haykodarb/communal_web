<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		label,
		value = $bindable(''),
		type = 'text',
		error = '',
		autocomplete,
		maxlength,
		rows = 0,
		oninput,
		onsubmit
	}: {
		label: string;
		value?: string;
		type?: 'text' | 'email' | 'password';
		error?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		maxlength?: number;
		/** Renders a multiline textarea with this many rows when > 0. */
		rows?: number;
		oninput?: () => void;
		onsubmit?: () => void;
	} = $props();

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && onsubmit) {
			event.preventDefault();
			onsubmit();
		}
	}
</script>

<label class="field">
	{#if rows > 0}
		<textarea
			bind:value
			{rows}
			{maxlength}
			placeholder={label}
			aria-label={label}
			class:error={error.length > 0}
			{oninput}
		></textarea>
	{:else}
		<input
			{type}
			bind:value
			{autocomplete}
			{maxlength}
			placeholder={label}
			aria-label={label}
			class:error={error.length > 0}
			{oninput}
			{onkeydown}
		/>
	{/if}
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
	input,
	textarea {
		padding: 0 20px;
		border-radius: 10px;
		border: 2px solid transparent;
		background: var(--surface-container);
		color: var(--on-surface);
		font: inherit;
		font-size: 16px;
		outline: none;
		transition: border-color 150ms ease;
	}
	input {
		height: 60px;
	}
	textarea {
		padding: 18px 20px;
		resize: vertical;
		line-height: 1.4;
	}
	input::placeholder,
	textarea::placeholder {
		color: var(--on-surface-variant);
		font-size: 14px;
	}
	input:focus,
	textarea:focus {
		border-color: var(--primary);
	}
	input.error,
	textarea.error {
		border-color: var(--error);
	}
	.error-text {
		font-size: 13px;
		color: var(--error);
		padding-left: 4px;
	}
</style>
