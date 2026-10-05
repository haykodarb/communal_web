<script lang="ts">
	import type { Community } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import CoverImage from './CoverImage.svelte';
	import Icon from './Icon.svelte';

	let { community }: { community: Community } = $props();
	let pinned = $state(false);
</script>

<div class="wrap">
	<a class="card" href={`/communities/${community.id}`}>
		<div class="body">
			<span class="name">{community.name}</span>
			<span class="members"
				>{community.user_count} {t('member')}{community.user_count === 1 ? '' : 's'}</span
			>
			{#if community.description}
				<span class="desc">{community.description}</span>
			{/if}
		</div>
		<div class="image">
			<CoverImage
				bucket="community_avatars"
				path={community.image_path}
				alt={community.name}
			/>
		</div>
	</a>
	<button
		class="pin"
		class:pinned
		type="button"
		aria-label={t('Pin')}
		onclick={() => (pinned = !pinned)}
	>
		<Icon name="pin" size={20} />
	</button>
</div>

<style>
	.wrap {
		position: relative;
	}
	.card {
		display: flex;
		min-height: 125px;
		border-radius: 10px;
		overflow: hidden;
		background: var(--surface-container);
		text-decoration: none;
		color: inherit;
	}
	.body {
		flex: 3;
		min-width: 0;
		padding: 15px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.name {
		font-size: 14px;
		font-weight: 600;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.members {
		font-size: 10px;
		color: var(--tertiary);
	}
	.desc {
		margin-top: auto;
		font-size: 12px;
		color: var(--on-surface-variant);
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.image {
		flex: 2;
		min-width: 0;
	}
	.pin {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 40px;
		height: 40px;
		border: none;
		border-radius: 50%;
		background: var(--surface-container);
		color: var(--on-surface-variant);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.pin.pinned {
		background: var(--tertiary);
		color: var(--surface-container);
	}
</style>
