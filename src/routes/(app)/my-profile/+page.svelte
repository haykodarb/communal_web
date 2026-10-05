<script lang="ts">
	import { goto } from '$app/navigation';
	import PillButton from '#lib/components/PillButton.svelte';
	import ProfileView from '#lib/components/ProfileView.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { getProfile } from '#lib/data/api.ts';
	import type { Profile } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let profile = $state<Profile | null>(null);
	let loading = $state(true);

	$effect(() => {
		const userId = auth.user?.id;
		if (!userId) return;
		loading = true;
		getProfile(userId)
			.then((p) => (profile = p))
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
