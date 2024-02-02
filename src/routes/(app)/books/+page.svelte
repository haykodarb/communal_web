<script lang="ts">
	import { getBookCover, type Book, getBooksForCurrentUser } from '$lib/tables/books';
	import LoadingIndicator from '../../../common/loading_indicator.svelte';

	const loading_cards: number[] = [1, 2, 3];
</script>

<div class="book_list">
	{#await getBooksForCurrentUser()}
		{#each loading_cards as num}
			<div class="book_card">
				<div class="cover_container">
					<LoadingIndicator height="100%" width="100%" border_radius="0px" />
				</div>
				<div class="book_info">
					<LoadingIndicator height="10%" width="80%" border_radius="0.5vh" />
					<LoadingIndicator height="10%" width="60%" border_radius="0.5vh" />
					<LoadingIndicator height="10%" width="40%" border_radius="0.5vh" />
				</div>
			</div>
		{/each}
	{:then data}
		{#if data.result != null}
			{#each data.result as book}
				<div class="book_card">
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
						<div>{book.title}</div>
						<div>{book.author}</div>
						<div>{book.available}</div>
					</div>
				</div>
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

	.book_card {
		display: flex;
		flex-direction: row;
		justify-content: start;
		width: 40%;
		height: 28vh;
		box-shadow: 0 0.25vh 0.5vh 0 rgba(var(--tertiary-rgb), 0.25) ;
		border-radius: 1vh;
		transition: 0.3s;
		overflow: hidden;
		cursor: pointer;
	}

	/* On mouse-over, add a deeper shadow */
	.book_card:hover {
		box-shadow: 0 0.5vh 1vh 0 rgba(var(--tertiary-rgb), 0.25) ;
	}

	.cover_container {
		aspect-ratio: 3/4;
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
</style>
