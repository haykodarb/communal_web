<script lang="ts">
	import Icon from './Icon.svelte';
	import { signedStorageUrl } from '#lib/data/api.ts';
	import type { Profile } from '#lib/data/models.ts';

	// Round profile picture (CommonCircularAvatar), falling back to an icon.
	let { profile, size = 50 }: { profile: Profile; size?: number } = $props();

	let url = $state<string | null>(null);

	$effect(() => {
		const path = profile.avatar_path;
		url = null;
		if (path) signedStorageUrl('profile_avatars', path).then((u) => (url = u));
	});
</script>

<span class="avatar" style:width="{size}px" style:height="{size}px">
	{#if url}
		<img src={url} alt="" />
	{:else}
		<Icon name="user" size={Math.round(size * 0.45)} />
	{/if}
</span>

<style>
	.avatar {
		flex: 0 0 auto;
		border-radius: 50%;
		overflow: hidden;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--primary) 18%, transparent);
		color: var(--primary);
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
