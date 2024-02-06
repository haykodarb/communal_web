<script lang="ts">
	import { page } from '$app/stores';
	import { getBookInformation, getBookCover, type Book } from '$lib/tables/books';
	import LoadingIndicator from '../../../../common/loading_indicator.svelte';
	const bookId = $page.params.bookId;

	let bookInformation = getBookInformation(bookId);
	console.log(bookInformation);

	export let data;

	let book: Book | undefined = data.books?.find((value) => value.id == bookId);
</script>

<div class="book_item">
	{#if book != undefined}
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
	{/if}
</div>
