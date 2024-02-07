<script lang="ts">
	import { page } from '$app/stores';
	import { getBookCover, type Book, getBookInformation } from '$lib/tables/books';
	import LoadingIndicator from '../../../../common/loading_indicator.svelte';
	const bookId = $page.params.bookId;

</script>

<div class="book_item">
	{#await getBookInformation(bookId)}
		Loading
	{:then { result }}
		{#if result}
			<div class="cover_container">
				{#await getBookCover(result)}
					<LoadingIndicator height="100%" width="100%" border_radius="0px" />
				{:then value}
					{#if value.result != null}
						<img
							src={URL.createObjectURL(value.result)}
							class="book_cover"
							alt="Cover for {result.title}"
						/>
					{/if}
				{/await}
			</div>
			<div class="book_info">
				<div class="title">{result.title}</div>
				<div>
					<div class="subtitle">Author</div>
					<div>{result.author}</div>
				</div>
				<div>
					<div class="subtitle">Available</div>
					<div>{result.available ? 'Yes' : 'No'}</div>
				</div>
			</div>
		{/if}
	{/await}
</div>
