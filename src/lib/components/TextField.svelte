<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n.svelte.ts';

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

	let visible = $state(false);

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && onsubmit) {
			event.preventDefault();
			onsubmit();
		}
	}

	// In a textarea Enter adds a line, so Ctrl+Enter (Cmd+Enter on a Mac)
	// submits instead.
	function onTextareaKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && onsubmit) {
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
			onkeydown={onTextareaKeydown}
		></textarea>
	{:else}
		<span class="control">
			<input
				type={type === 'password' && visible ? 'text' : type}
				bind:value
				{autocomplete}
				{maxlength}
				placeholder={label}
				aria-label={label}
				class:error={error.length > 0}
				class:with-toggle={type === 'password'}
				{oninput}
				{onkeydown}
			/>
			{#if type === 'password'}
				<!-- CommonPasswordField's visibility toggle. -->
				<button
					type="button"
					class="toggle"
					aria-label={visible ? t('Hide password') : t('Show password')}
					aria-pressed={visible}
					onclick={() => (visible = !visible)}
				>
					<Icon name={visible ? 'eye' : 'eye-off'} size={20} />
				</button>
			{/if}
		</span>
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
		/* Focusing fades the border to primary. */
		transition: border-color 300ms ease;
	}
	.control {
		position: relative;
		display: flex;
	}
	input {
		flex: 1;
		min-width: 0;
		height: 60px;
	}
	input.with-toggle {
		padding-right: 56px;
	}
	.toggle {
		position: absolute;
		top: 50%;
		right: 12px;
		transform: translateY(-50%);
		display: flex;
		padding: 6px;
		border: none;
		background: none;
		color: var(--on-surface-variant);
		cursor: pointer;
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
