<script lang="ts">
	import { goto } from '$app/navigation';
	import PageBar from '#lib/components/PageBar.svelte';
	import BookForm from '#lib/components/BookForm.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { addBook } from '#lib/data/api.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { toast } from '#lib/toast.svelte.ts';
</script>

<svelte:head>
	<title>{t('Add book')} · Communal</title>
</svelte:head>

<div class="page">
	<PageBar title={t('Add book')} mobileTitle />
	<BookForm
		submitLabel="Add"
		onsubmit={async (form, cover) => {
			const book = await addBook(auth.user!.id, form, cover!);
			await goto(`/my-books/${book.id}`, { replace: true });
			toast.show(t('Book added'));
		}}
	/>
</div>

<style>
	.page {
		padding: 16px 20px 40px;
	}
</style>
