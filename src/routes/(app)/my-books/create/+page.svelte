<script lang="ts">
	import { goto } from '$app/navigation';
	import BookForm from '#lib/components/BookForm.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { addBook } from '#lib/data/api.ts';
	import { t } from '#lib/i18n.svelte.ts';
</script>

<div class="page">
	<button class="back" type="button" aria-label={t('Back')} onclick={() => goto('/my-books')}>
		<Icon name="chevron-left" size={32} />
	</button>
	<h1>{t('Add book')}</h1>
	<BookForm
		submitLabel="Add"
		onsubmit={async (form, cover) => {
			const book = await addBook(auth.user!.id, form, cover!);
			await goto(`/my-books/${book.id}`, { replaceState: true });
		}}
	/>
</div>

<style>
	.page {
		padding: 16px 20px 40px;
	}
	.back {
		background: none;
		border: none;
		color: var(--on-surface);
		cursor: pointer;
		padding: 0;
		margin-bottom: 12px;
	}
	h1 {
		font-size: 32px;
		font-weight: 800;
		margin-bottom: 20px;
	}
</style>
