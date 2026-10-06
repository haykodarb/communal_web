<script lang="ts">
	import { goto } from '$app/navigation';
	import PageBar from '#lib/components/PageBar.svelte';
	import BookForm from '#lib/components/BookForm.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { addBook } from '#lib/data/api.ts';
	import { t } from '#lib/i18n.svelte.ts';
</script>

<div class="page">
	<PageBar title={t('Add book')} mobileTitle />
	<BookForm
		submitLabel="Add"
		onsubmit={async (form, cover) => {
			const book = await addBook(auth.user!.id, form, cover!);
			await goto(`/app/my-books/${book.id}`, { replace: true });
		}}
	/>
</div>

<style>
	.page {
		padding: 16px 20px 40px;
	}
</style>
