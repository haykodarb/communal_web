<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import BookForm from '#lib/components/BookForm.svelte';
	import Icon from '#lib/components/Icon.svelte';
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
	<button class="back" type="button" aria-label={t('Back')} onclick={() => goto(`/my-books/${id}`)}>
		<Icon name="chevron-left" size={32} />
	</button>
	<h1>{t('Edit book')}</h1>

	{#if loading}
		<p class="muted">{t('Loading…')}</p>
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
	.muted {
		color: var(--on-surface-variant);
	}
</style>
