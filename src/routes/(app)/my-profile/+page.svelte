<script lang="ts">
	import { goto } from '$app/navigation';
	import PillButton from '#lib/components/PillButton.svelte';
	import ProfileView from '#lib/components/ProfileView.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { getBooksForUser, getProfile, getReviewsForUser } from '#lib/data/api.ts';
	import type { Book, Loan, Profile } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let profile = $state<Profile | null>(null);
	let books = $state<Book[]>([]);
	let reviews = $state<Loan[]>([]);
	let loading = $state(true);

	$effect(() => {
		const userId = auth.user?.id;
		if (!userId) return;
		loading = true;
		Promise.all([getProfile(userId), getBooksForUser(userId), getReviewsForUser(userId)])
			.then(([p, b, r]) => {
				profile = p;
				books = b;
				reviews = r;
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

<div class="page">
	{#if loading}
		<p class="muted">{t('Loading…')}</p>
	{:else if profile}
		<ProfileView
			{profile}
			{books}
			{reviews}
			emptyBooks={t('You have not uploaded any books.')}
			emptyReviews={t('You have not reviewed any books yet.')}
		>
			{#snippet actions()}
				<PillButton icon="pencil" label={t('Edit profile')} onclick={() => goto('/my-profile/edit')} />
			{/snippet}
		</ProfileView>
	{:else}
		<p class="muted">{t('Profile not found.')}</p>
	{/if}
</div>

<style>
	.page {
		padding: 10px 0 40px;
	}
	.muted {
		padding: 20px;
		color: var(--on-surface-variant);
	}
</style>
