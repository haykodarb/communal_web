<script lang="ts">
	import { goto } from '$app/navigation';
	import BookCard from '#lib/components/BookCard.svelte';
	import Fab from '#lib/components/Fab.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { getBooksForUser } from '#lib/data/api.ts';
	import type { Book } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let books = $state<Book[]>([]);
	let loading = $state(true);
	let error = $state('');

	async function load(search = '') {
		const userId = auth.user?.id;
		if (!userId) return;
		loading = true;
		error = '';
		try {
			books = await getBooksForUser(userId, { search });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		const userId = auth.user?.id;
		if (userId) void load();
	});
</script>

<div class="page">
	<SearchBar onSearch={(q) => load(q)} onFilter={() => {}} />

	{#if error}
		<p class="error">{error}</p>
	{:else if loading}
		<p class="muted">{t('Loading…')}</p>
	{:else if books.length === 0}
		<div class="empty">
			<p>{t('No books found in your library.')}</p>
			<p>{t('You can upload some with the floating button on the bottom right.')}</p>
		</div>
	{:else}
		<div class="list">
			{#each books as book (book.id)}
				<BookCard {book} />
			{/each}
		</div>
	{/if}

	<Fab icon="plus" label={t('Add book')} onclick={() => goto('/my-books/create')} />
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 0 5px;
	}
	.muted {
		padding: 0 10px;
		color: var(--on-surface-variant);
	}
	.error {
		padding: 0 10px;
		color: var(--error);
	}
	.empty {
		margin-top: 40px;
		padding: 0 20px;
		text-align: center;
		color: var(--on-surface-variant);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	/* Flutter adds a 20px spacer above the search bar on desktop. */
	@media (min-width: 800px) {
		.page {
			padding-top: 20px;
		}
	}
</style>
