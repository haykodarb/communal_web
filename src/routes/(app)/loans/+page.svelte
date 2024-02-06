<script lang="ts">
	import { getLoansWhere } from '$lib/tables/loans';
	import { el } from 'date-fns/locale';
	import Card from '../../../common/card.svelte';
	import ThreeDotsVert from '../../../assets/icons/three_dots_vert.svelte';

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

<div class="main_container">
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
								<div class="card_content">
									<div class="card_top_row">
										<div class="title">
											{#if loan.books != null}
												{loan.books.title}
											{:else}
												{loan.tools?.name}
											{/if}
										</div>
										<button class="menu_button">
											<ThreeDotsVert size="4vh" />
										</button>
									</div>

									<div class="status">
										Requested {#if data.user?.id == loan.loanee}
											from {loan.owner_profile.username}
										{:else}
											by <button class="user">{loan.loanee_profile.username}</button>
										{/if}
									</div>
									<div class="card_bottom_row">
										<div class="status">
											{#if loan.accepted}
												Loan approved
											{:else}
												Pending Approval
											{/if}
										</div>
										<div class="date">Sun, Jan 21</div>
									</div>
								</div>
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
						<div class="card_container">
							<Card>
								<div class="card_content">
									<div class="card_top_row">
										<div class="title">
											{#if loan.books != null}
												{loan.books.title}
											{:else}
												{loan.tools?.name}
											{/if}
										</div>
										<button class="menu_button">
											<ThreeDotsVert size="4vh" />
										</button>
									</div>

									<div class="status">
										Requested from <button class="user">{loan.loanee_profile.username}</button>
									</div>
									<div class="card_bottom_row">
										<div class="status">
											{#if loan.accepted}
												Loan approved
											{:else}
												Pending Approval
											{/if}
										</div>
										<div class="date">Sun, Jan 21</div>
									</div>
								</div>
							</Card>
						</div>
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
						<div class="card_container">
							<Card>
								<div class="card_content">
									<div class="card_top_row">
										<div class="title">
											{#if loan.books != null}
												{loan.books.title}
											{:else}
												{loan.tools?.name}
											{/if}
										</div>
										<button class="menu_button">
											<ThreeDotsVert size="4vh" />
										</button>
									</div>

									<div class="status">
										Requested {loan.loanee == data.user?.id ? 'from' : 'by'}
										<button class="user">{loan.loanee_profile.username}</button>
									</div>
									<div class="card_bottom_row">
										<div class="status">Returned Sun, Jan 21</div>
									</div>
								</div>
							</Card>
						</div>
					{/each}
				{/if}
			{/await}
		{/if}
	</div>
</div>

<style>
	.main_container {
		height: 100%;
		width: 100%;
		overflow: scroll;
		box-sizing: border-box;
	}

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
		transition: 0.3s;
	}

	.tab_button:hover {
		background-color: var(--surface);
	}

	.tab_button.active {
		box-shadow: 0vh 0.3vh 0vh 0vh rgba(var(--primary-rgb), 1);
	}

	.body_content {
		width: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
		gap: 2vh;
		padding-top: 4vh;
		padding-bottom: 4vh;
	}

	.card_container {
		width: 30vw;
	}

	.card_content {
		padding: 3vh;
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		box-sizing: border-box;
	}

	.card_top_row {
		padding-bottom: 2vh;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.card_bottom_row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.title {
		font-size: 3vh;
		font-weight: bold;
	}

	.user {
		font-size: 2vh;
		outline: none;
		border: none;
		background: none;
		color: var(--primary);
		cursor: pointer;
		padding: 0px;
		margin: 0px;
		border-radius: 5%;
	}

	.user:hover {
		background-color: var(--primary);
		color: var(--onPrimary);
	}

	.status {
		font-size: 2vh;
	}

	.date {
		color: rgba(var(--onSurface-rgb), 0.5);
	}

	.menu_button {
		background: none;
		outline: none;
		border: none;
		cursor: pointer;
		border-radius: 75%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		fill: var(--onSurface);
	}

	.menu_button:hover {
		background-color: var(--surface);
		fill: var(--primary);
	}
</style>
