<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import CoverImage from '#lib/components/CoverImage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { getCommunityById } from '#lib/data/api.ts';
	import type { Community } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let community = $state<Community | null>(null);
	let loading = $state(true);

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		loading = true;
		getCommunityById(id)
			.then((result) => {
				community = result;
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

<div class="detail">
	<button class="back" type="button" aria-label={t('Back')} onclick={() => goto('/communities')}>
		<Icon name="chevron-left" size={32} />
	</button>

	{#if loading}
		<p class="muted">{t('Loading…')}</p>
	{:else if community}
		<div class="avatar">
			<CoverImage
				bucket="community_avatars"
				path={community.image_path}
				alt={community.name}
				rounded
			/>
		</div>
		<h1>{community.name}</h1>
		<p class="members"
			>{community.user_count} {t('member')}{community.user_count === 1 ? '' : 's'}</p
		>
		{#if community.description}
			<p class="description">{community.description}</p>
		{/if}
	{:else}
		<p class="muted">{t('Community not found.')}</p>
	{/if}
</div>

<style>
	.detail {
		padding: 16px 20px 40px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	.back {
		align-self: flex-start;
		background: none;
		border: none;
		color: var(--on-surface);
		cursor: pointer;
		padding: 0;
		margin-bottom: 8px;
	}
	.avatar {
		width: 140px;
		height: 140px;
		border-radius: 50%;
		overflow: hidden;
		margin-bottom: 16px;
	}
	h1 {
		font-size: 24px;
		font-weight: 700;
	}
	.members {
		margin-top: 4px;
		font-size: 13px;
		color: var(--tertiary);
	}
	.description {
		margin-top: 18px;
		font-size: 15px;
		line-height: 1.5;
		color: var(--on-surface-variant);
	}
	.muted {
		color: var(--on-surface-variant);
	}
</style>
