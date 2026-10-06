<script lang="ts">
	import { goto } from '$app/navigation';
	import PillButton from '#lib/components/PillButton.svelte';
	import ProfileView from '#lib/components/ProfileView.svelte';
	import { t } from '#lib/i18n.svelte.ts';
	import type { PageProps } from './$types';

	// Your own profile; it and its Books/Reviews tabs come from the load
	// (through the page cache).
	let { data }: PageProps = $props();
	const profile = $derived(data.profile);
</script>

<div class="page">
	{#if profile}
		<ProfileView
			{profile}
			lists={data.lists}
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
