<script lang="ts">
	import { signedStorageUrl } from '#lib/data/api.ts';
	import type { Profile } from '#lib/data/models.ts';

	// CommonCircularAvatar: the profile picture, or one of six default emblems
	// picked from the username, drawn on a primary-colored circle.
	let { profile, size = 50 }: { profile: Profile; size?: number } = $props();

	let url = $state<string | null>(null);

	$effect(() => {
		const path = profile.avatar_path;
		url = null;
		if (path) signedStorageUrl('profile_avatars', path).then((u) => (url = u));
	});

	// Same rule as Flutter's _iconAvatar: sum of the first six char codes, mod 6.
	const emblem = $derived.by(() => {
		let sum = 0;
		for (let i = 0; i < profile.username.length && i <= 5; i++) sum += profile.username.charCodeAt(i);
		return `/default_avatars/${sum % 6}.svg`;
	});
</script>

<span class="avatar" style:width="{size}px" style:height="{size}px">
	{#if url}
		<img src={url} alt="" />
	{:else if profile.id}
		<span class="emblem" style:--emblem="url({emblem})"></span>
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
		background: var(--primary);
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	/* The SVG is used as a mask so it takes the theme color, like Flutter's
	   ColorFilter (surfaceContainer, srcIn); 17.5% padding on each side. */
	.emblem {
		width: 65%;
		height: 65%;
		background: var(--surface-container);
		mask: var(--emblem) center / contain no-repeat;
		-webkit-mask: var(--emblem) center / contain no-repeat;
	}
</style>
