<script lang="ts">
	// CommonFilterRow: a title and a wrap of pill options, one selected.
	let {
		title,
		options,
		index,
		onchange
	}: { title: string; options: string[]; index: number; onchange: (index: number) => void } =
		$props();
</script>

<div class="row" role="radiogroup" aria-label={title}>
	<span class="title">{title}</span>
	<div class="options">
		{#each options as option, i (option)}
			<button
				type="button"
				role="radio"
				aria-checked={i === index}
				class:selected={i === index}
				onclick={() => onchange(i)}
			>
				{option}
			</button>
		{/each}
	</div>
</div>

<style>
	.row {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.title {
		font-size: 14px;
		font-weight: 500;
	}
	.options {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	button {
		padding: 10px 15px;
		border: 0.5px solid var(--on-surface-variant);
		border-radius: 40px;
		background: none;
		color: var(--on-surface-variant);
		font: inherit;
		font-size: 14px;
		cursor: pointer;
	}
	button.selected {
		border: 1.5px solid var(--primary);
		color: var(--primary);
		font-weight: 500;
	}
</style>
