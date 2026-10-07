<script lang="ts">
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n.svelte.ts';

	let {
		value = $bindable(''),
		placeholder = `${t('Search')}...`,
		onSearch,
		onFilter
	}: {
		value?: string;
		placeholder?: string;
		onSearch?: (value: string) => void;
		onFilter?: () => void;
	} = $props();

	let timer: ReturnType<typeof setTimeout> | undefined;

	function handleInput() {
		clearTimeout(timer);
		timer = setTimeout(() => onSearch?.(value), 300);
	}

	// Our own clear button (the browser's is hidden below): empties the field,
	// searches right away and keeps the cursor in it.
	let input: HTMLInputElement;
	function clear() {
		clearTimeout(timer);
		value = '';
		onSearch?.('');
		input.focus();
	}
</script>

<div class="search-row">
	<label class="search">
		<Icon name="search" size={20} />
		<input
			bind:this={input}
			type="search"
			bind:value
			{placeholder}
			aria-label={placeholder}
			oninput={handleInput}
		/>
		{#if value}
			<button class="clear" type="button" aria-label={t('Clear search')} onclick={clear}>
				<Icon name="x" size={18} />
			</button>
		{/if}
	</label>
	{#if onFilter}
		<button class="filter" type="button" aria-label={t('Filter')} onclick={onFilter}>
			<Icon name="sliders" size={20} />
		</button>
	{/if}
</div>

<style>
	.search-row {
		display: flex;
		align-items: center;
		gap: 5px;
		height: 50px;
		padding: 0 5px 2px;
	}
	.search {
		flex: 1 1 0;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 10px;
		height: 50px;
		padding: 0 14px;
		border-radius: 10px;
		background: var(--surface-container);
		color: var(--on-surface);
	}
	.search input {
		flex: 1;
		min-width: 0;
		height: 100%;
		border: none;
		background: transparent;
		color: var(--on-surface);
		font-size: 14px;
		outline: none;
	}
	.search input::placeholder {
		color: var(--on-surface-variant);
	}
	/* Hide the browser's own clear (×) button (ours is .clear); keeping
	   type="search" still gives phones a Search key. */
	.search input::-webkit-search-cancel-button,
	.search input::-webkit-search-decoration {
		-webkit-appearance: none;
		appearance: none;
		display: none;
	}
	/* Round, quiet, in the field's text colour; the shared hover layer (app.css)
	   follows its radius. */
	.clear {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		margin-right: -6px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: none;
		color: var(--on-surface-variant);
		cursor: pointer;
	}
	.filter {
		width: 50px;
		height: 50px;
		flex: 0 0 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 10px;
		background: var(--surface-container);
		color: var(--on-surface);
		cursor: pointer;
	}
</style>
