<script lang="ts">
	import LoanCard from '#lib/components/LoanCard.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { getLoansForUser } from '#lib/data/api.ts';
	import type { Loan } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let loans = $state<Loan[]>([]);
	let loading = $state(true);
	let error = $state('');

	async function load(search = '') {
		const userId = auth.user?.id;
		if (!userId) return;
		loading = true;
		error = '';
		try {
			loans = await getLoansForUser(userId, { search });
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
	{:else if loans.length === 0}
		<div class="empty">
			<p>{t('No loans found.')}</p>
		</div>
	{:else}
		<div class="list">
			{#each loans as loan (loan.id)}
				<LoanCard {loan} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.page {
		min-height: 100vh;
		padding-bottom: 40px;
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
	}
</style>
