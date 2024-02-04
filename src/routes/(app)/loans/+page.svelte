<script lang="ts">
	import { getLoansWhere } from '$lib/tables/loans';
	import Card from '../../../common/card.svelte';

	export let data;

	let show_owned = true;
	let show_borrowed = false;
	let show_completed = false;

	const selectOwned = () => {
		show_borrowed = false;
		show_completed = false;
		show_owned = true;
	};

	const selectBorrowed = () => {
		show_owned = false;
		show_completed = false;
		show_borrowed = true;
	};

	const selectCompleted = () => {
		show_owned = false;
		show_borrowed = false;
		show_completed = true;
	};
</script>

<div style="width: 100%;">
	<div class="tab_bar">
		<button on:click={selectOwned} class={`tab_button ${show_owned ? 'active' : ''}`}>Owned</button>
		<button on:click={selectBorrowed} class={`tab_button ${show_borrowed ? 'active' : ''}`}
			>Borrowed</button
		>
		<button on:click={selectCompleted} class={`tab_button ${show_completed ? 'active' : ''}`}
			>Completed</button
		>
	</div>
	<div class="body_content">
		{#if show_owned}
			{#await getLoansWhere('owned')}
				loading
			{:then loans}
				{#if loans.result != null}
					{#each loans.result as loan}
						<div class="card_container">
							<Card>
								<div class="title">
									{#if loan.books != null}
										{loan.books.title}
									{:else}
										{loan.tools?.name}
									{/if}
								</div>
								<div class="user">
									Requested {#if data.user?.id == loan.loanee}
										from {loan.owner_profile.username}
									{:else}
										by {loan.loanee_profile.username}
									{/if}
								</div>
								<div class="status"></div>
							</Card>
						</div>
					{/each}
				{/if}
			{/await}
		{/if}

		{#if show_borrowed}
			{#await getLoansWhere('borrowed')}
				loading
			{:then loans}
				{#if loans.result != null}
					{#each loans.result as loan}
						{#if loan.books != null}
							{loan.books.title}
						{:else}
							{loan.tools?.name}
						{/if}
					{/each}
				{/if}
			{/await}
		{/if}

		{#if show_completed}
			{#await getLoansWhere('completed')}
				loading
			{:then loans}
				{#if loans.result != null}
					{#each loans.result as loan}
						{#if loan.books != null}
							{loan.books.title}
						{:else}
							{loan.tools?.name}
						{/if}
					{/each}
				{/if}
			{/await}
		{/if}
	</div>
</div>

<style>
	.tab_bar {
		width: 50%;
		height: 8vh;
		display: flex;
		flex-direction: row;
	}

	.tab_button {
		background-color: var(--background);
		color: var(--onBackground);
		border: none;
		outline: none;
		font-size: 2vh;
		flex: 1;
		box-shadow: 0vh 0.2vh 0vh 0vh rgba(var(--tertiary-rgb), 0.2);
		cursor: pointer;
	}

	.tab_button.active {
		box-shadow: 0vh 0.2vh 0vh 0vh rgba(var(--primary-rgb), 1);
	}

	.body_content {
		height: 100%;
		width: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
		padding: 2%;
	}

	.card_container {
		height: 20vh;
		width: 30vw;
	}
</style>
