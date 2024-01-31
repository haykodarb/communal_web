<script lang="ts">
	import { getBookCover, type Book, getBooksForCurrentUser } from '$lib/tables/books';
	import LoadingImage from '../../../common/loading_image.svelte';
</script>

<div class="book_list">
	{#await getBooksForCurrentUser()}
		<div style="position: absolute; align-self: center; justify-self: center;">Loading</div>
	{:then data}
		{#if data.result != null}
			{#each data.result as book}
				<div class="book_card">
					{#await getBookCover(book)}
						<LoadingImage height="10vh" width="10vh" border_radius="10px" />
					{:then value}
						{#if value.result != null}
							<img
								src={URL.createObjectURL(value.result)}
								class="book_cover"
								alt="Cover for {book.title}"
							/>
						{/if}
					{/await}
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
	}

	.book_card {
		display: flex;
		flex-direction: row;
		justify-content: start;
		width: 40%;
		height: 28vh;
		box-shadow: 0 0.25vh 0.5vh 0 rgba(0, 0, 0, 0.2);
		border-radius: 1vh;
		transition: 0.3s;
		overflow: hidden;
		cursor: pointer;
	}

	/* On mouse-over, add a deeper shadow */
	.book_card:hover {
		box-shadow: 0 0.5vh 1vh 0 rgba(0, 0, 0, 0.2);
	}

	.book_cover {
		height: 100%;
	}

	.book_info {
		height: 100%;
		display: flex;
        font-size: 2vh;
		flex-direction: column;
		padding: 2%;
		gap: 5%;
	}
</style>
