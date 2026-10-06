<script lang="ts">
	import { untrack } from 'svelte';
	import FilterRow from '#lib/components/FilterRow.svelte';
	import Loading from '#lib/components/Loading.svelte';
	import FilterSheet from '#lib/components/FilterSheet.svelte';
	import LoanCard from '#lib/components/LoanCard.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import StickySearch from '#lib/components/StickySearch.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import { store } from '#lib/cache.ts';
	import { getLoansForUser, type LoansQuery } from '#lib/data/api.ts';
	import { keys, PAGE_SIZE } from '#lib/data/pages.ts';
	import type { Loan } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';
	import type { PageProps } from './$types';

	// LoansPage with LoansController's filter sheet and infinite scroll. The first
	// page comes from the load (through the page cache).
	let { data }: PageProps = $props();

	/** Status options -> filter flags, as in LoansController.onFilterByStatusChanged. */
	const STATUS: LoansQuery[] = [
		{ allStatus: true },
		{ allStatus: false, accepted: false, returned: false, rejected: false }, // pending
		{ allStatus: false, accepted: true, returned: false, rejected: false }, // accepted
		{ allStatus: false, accepted: true, returned: true, rejected: false }, // completed
		{ allStatus: false, accepted: false, returned: false, rejected: true } // rejected
	];
	/** Ownership options: all / own books (owner) / foreign books (loanee). */
	const OWNERSHIP: LoansQuery[] = [
		{ userIsOwner: true, userIsLoanee: true },
		{ userIsOwner: true, userIsLoanee: false },
		{ userIsOwner: false, userIsLoanee: true }
	];

	let search = $state('');
	let orderIndex = $state(0);
	let statusIndex = $state(0);
	let ownershipIndex = $state(0);
	let sheet: FilterSheet;

	/** The cache holds the unfiltered list only. */
	const unfiltered = () =>
		!search && orderIndex === 0 && statusIndex === 0 && ownershipIndex === 0;

	const loans = createPaged<Loan>(
		(page) =>
			getLoansForUser(data.userId, {
				...STATUS[statusIndex],
				...OWNERSHIP[ownershipIndex],
				orderByDate: orderIndex === 0,
				search,
				page,
				pageSize: PAGE_SIZE.loans
			}),
		PAGE_SIZE.loans,
		{
			seed: untrack(() => data.loans),
			onChange: (state) => {
				if (unfiltered()) store(keys.loans(data.userId), state);
			}
		}
	);

	// A background refresh of the cached list lands here.
	$effect(() => {
		const fresh = data.loans;
		untrack(() => {
			if (unfiltered()) loans.seed(fresh);
		});
	});

	function set(update: () => void) {
		update();
		loans.reset();
	}
</script>

<div class="page">
	<StickySearch>
		<SearchBar bind:value={search} onSearch={() => loans.reset()} onFilter={() => sheet.open()} />
	</StickySearch>

	{#if loans.items.length > 0}
		<div class="list">
			{#each loans.items as loan (loan.id)}
				<LoanCard {loan} />
			{/each}
		</div>
	{:else if loans.error}
		<p class="error">{loans.error}</p>
	{:else if !loans.loading && !loans.hasMore}
		<div class="empty">
			<p>{t('No loans found.')}</p>
		</div>
	{/if}
	{#if loans.loading}
		<Loading fill={loans.items.length === 0} />
	{/if}
	<Sentinel onvisible={loans.loadMore} />
</div>

<FilterSheet bind:this={sheet}>
	<FilterRow
		title={t('Order by')}
		options={[t('Date'), t('Title')]}
		index={orderIndex}
		onchange={(i) => set(() => (orderIndex = i))}
	/>
	<FilterRow
		title={t('Filter by status')}
		options={[t('All'), t('Pending'), t('Accepted'), t('Completed'), t('Rejected')]}
		index={statusIndex}
		onchange={(i) => set(() => (statusIndex = i))}
	/>
	<FilterRow
		title={t('Filter by book ownership')}
		options={[t('All'), t('Own'), t('Foreign')]}
		index={ownershipIndex}
		onchange={(i) => set(() => (ownershipIndex = i))}
	/>
</FilterSheet>

<style>
	.page {
		min-height: 100vh;
		padding-bottom: 40px;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px 5px 0;
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
	/* Flutter adds a 20px spacer above the search bar on desktop. */
	@media (min-width: 800px) {
		.page {
			padding-top: 20px;
		}
	}
</style>
