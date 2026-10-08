<script lang="ts">
	import { appear } from '#lib/motion.ts';
	import FillCenter from '#lib/components/FillCenter.svelte';
	import { untrack } from 'svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import ErrorState from '#lib/components/ErrorState.svelte';
	import FilterRow from '#lib/components/FilterRow.svelte';
	import PageBar from '#lib/components/PageBar.svelte';
	import Loading from '#lib/components/Loading.svelte';
	import Skeleton from '#lib/components/Skeleton.svelte';
	import FilterSheet from '#lib/components/FilterSheet.svelte';
	import LoanCard from '#lib/components/LoanCard.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import StickySearch from '#lib/components/StickySearch.svelte';
	import Sentinel from '#lib/components/Sentinel.svelte';
	import { peek, store } from '#lib/cache.ts';
	import { getLoansForUser, type LoansQuery } from '#lib/data/api.ts';
	import { keys, PAGE_SIZE } from '#lib/data/pages.ts';
	import type { Loan } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';
	import { optionFrom, optionParam, textFrom, writeFilters } from '#lib/url-state.ts';
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

	// The search and the sheet's choices live in the URL (?q=, ?sort=, ?status=,
	// ?side=), so coming back to the list keeps them.
	const SORT = ['date', 'title'];
	const STATUS_NAMES = ['all', 'pending', 'accepted', 'completed', 'rejected'];
	const SIDE = ['all', 'lent', 'borrowed'];

	let search = $state(textFrom(untrack(() => data.query), 'q'));
	let orderIndex = $state(optionFrom(untrack(() => data.query), 'sort', SORT));
	let statusIndex = $state(optionFrom(untrack(() => data.query), 'status', STATUS_NAMES));
	let ownershipIndex = $state(optionFrom(untrack(() => data.query), 'side', SIDE));
	let sheet: FilterSheet;

	const unfiltered = () =>
		!search && orderIndex === 0 && statusIndex === 0 && ownershipIndex === 0;

	// Each filter combination is cached under its own key (sharing the list's
	// prefix, so mutations drop them too), so coming back to a filtered list
	// shows it at once, every page included, instead of a skeleton.
	const cacheKey = () =>
		unfiltered() ? keys.loans(data.userId) : `${keys.loans(data.userId)}:${JSON.stringify([search.trim(), orderIndex, statusIndex, ownershipIndex])}`;

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
			seed: untrack(() => (unfiltered() ? data.loans : peek(cacheKey()))),
			onChange: (state) => {
				store(cacheKey(), state);
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

	// Opened with filters from the URL and nothing cached for them: load.
	if (!untrack(unfiltered) && !untrack(() => peek(cacheKey()))) loans.reset();

	$effect(() => {
		writeFilters({
			q: search.trim() || null,
			sort: optionParam(SORT, orderIndex),
			status: optionParam(STATUS_NAMES, statusIndex),
			side: optionParam(SIDE, ownershipIndex)
		});
	});

	function set(update: () => void) {
		update();
		loans.reset();
	}
</script>

<svelte:head>
	<title>{t('Loans')} · Communal</title>
</svelte:head>

<div class="page">
	<PageBar title={t('Loans')} />

	<StickySearch>
		<SearchBar bind:value={search} onSearch={() => loans.reset()} onFilter={() => sheet.open()} />
	</StickySearch>

	{#if loans.items.length > 0}
		<div class="list">
			{#each loans.items as loan, i (loan.id)}
				<div in:appear={{ index: i % PAGE_SIZE.loans }}><LoanCard {loan} /></div>
			{/each}
		</div>
	{:else if loans.error}
		<FillCenter><ErrorState message={loans.error} onretry={() => loans.reset()} /></FillCenter>
	{:else if !loans.loading && !loans.hasMore}
		<EmptyState icon="loans" title={t('No loans found.')} />
	{/if}
	{#if loans.loading}
		{#if loans.items.length === 0}
			<div class="list"><Skeleton kind="loan" count={4} /></div>
		{:else}
			<Loading fill={false} />
		{/if}
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
</style>
