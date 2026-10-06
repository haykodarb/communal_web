<script lang="ts">
	import { page } from '$app/state';
	import Loading from '#lib/components/Loading.svelte';
	import { goto } from '$app/navigation';
	import PageBar from '#lib/components/PageBar.svelte';
	import BookForm from '#lib/components/BookForm.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { getBookById, updateBook } from '#lib/data/api.ts';
	import type { Book } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let book = $state<Book | null>(null);
	let loading = $state(true);

	const id = $derived(page.params.id!);

	$effect(() => {
		loading = true;
		getBookById(id)
			.then((result) => (book = result))
			.finally(() => (loading = false));
	});
</script>

<div class="page">
	<PageBar title={t('Edit book')} mobileTitle onback={() => goto(`/my-books/${id}`)} />

	{#if loading}
		<Loading />
	{:else if book}
		<BookForm
			{book}
			submitLabel="Save"
			onsubmit={async (form, cover) => {
				await updateBook(auth.user!.id, book!, form, cover);
				await goto(`/my-books/${id}`, { replace: true });
			}}
		/>
	{:else}
		<p class="muted">{t('Book not found.')}</p>
	{/if}
</div>

<style>
	.page {
		padding: 16px 20px 40px;
	}
	.muted {
		color: var(--on-surface-variant);
	}
</style>
