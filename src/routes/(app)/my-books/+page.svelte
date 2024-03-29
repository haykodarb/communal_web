<script lang="ts">
	import { getBookCover, type Book, getBooksForCurrentUser } from '$lib/tables/books';
	import LoadingIndicator from '../../../common/loading_indicator.svelte';

	const loading_cards: number[] = [1, 2, 3];

</script>

<div class="book_list">
	<a class="add_button" href="/my-books/add"> Add a Book</a>
	{#await getBooksForCurrentUser()}
		{#each loading_cards as card}
		<div class="book_card">
			<div class="cover_container">
				<LoadingIndicator height="100%" width="100%" border_radius="0px" />
			</div>
			<div class="book_info">
				<LoadingIndicator height="15%" width="80%" border_radius="0.5vh" />
				<LoadingIndicator height="10%" width="40%" border_radius="0.5vh" />
				<LoadingIndicator height="10%" width="40%" border_radius="0.5vh" />
			</div>
		</div>
		{/each}
	{:then { result }}
		{#if result != undefined}
			{#each result as book}
				<a class="book_card" href={`/my-books/${book.id}`}>
					<div class="cover_container">
						{#await getBookCover(book)}
							<LoadingIndicator height="100%" width="100%" border_radius="0px" />
						{:then value}
							{#if value.result != null}
								<img
									src={URL.createObjectURL(value.result)}
									class="book_cover"
									alt="Cover for {book.title}"
								/>
							{/if}
						{/await}
					</div>
					<div class="book_info">
						<div class="title">{book.title}</div>
						<div>
							<div class="subtitle">Author</div>
							<div>{book.author}</div>
						</div>
						<div>
							<div class="subtitle">Available</div>
							<div>{book.available ? 'Yes' : 'No'}</div>
						</div>
					</div>
				</a>
			{/each}
		{/if}
	{/await}
</div>

<style>
	.book_list {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: start;
		overflow: scroll;
		box-sizing: border-box;
		padding: 2%;
		gap: 2%;
		color: var(--onBackground) !important;
	}

	.add_button {
		display: flex;
		flex-direction: column;
		justify-content: center;
		cursor: pointer;
		width: 40%;
		min-height: 5vh;
		outline: none;
		border: 0.25vh solid var(--primary);
		border-radius: 1vh;
		font-size: 2.5vh;
		transition: 0.3s;
		background: none;
		text-decoration: none;
		text-align: center;
		vertical-align: middle;
		color: var(--onBackground);
	}

	.add_button:hover {
		background-color: var(--surface);
	}

	.book_card {
		display: flex;
		flex-direction: row;
		justify-content: start;
		gap: 2%;
		width: 40%;
		min-height: 30vh;
		max-height: 30vh;
		box-shadow: 0 0.25vh 0.5vh 0 rgba(var(--tertiary-rgb), 0.25);
		border-radius: 1vh;
		transition: 0.3s;
		overflow: hidden;
		cursor: pointer;
		background-color: rgba(var(--tertiary-rgb), 0.025);
		color: var(--onBackground);
		border: none;
		text-decoration: none;
		text-align: left;
	}

	/* On mouse-over, add a deeper shadow */
	.book_card:hover {
		box-shadow: 0 0.5vh 1vh 0 rgba(var(--tertiary-rgb), 0.25);
	}

	.cover_container {
		aspect-ratio: 3/4;
		max-width: 50%;
	}

	.book_cover {
		height: 100%;
		width: 100%;
	}

	.book_info {
		height: 100%;
		display: flex;
		font-size: 2vh;
		flex-direction: column;
		flex: 1;
		padding: 2%;
		gap: 5%;
	}

	.title {
		font-size: 2.5vh;
		font-weight: 900;
	}

	.subtitle {
		color: var(--secondary);
	}
</style>
