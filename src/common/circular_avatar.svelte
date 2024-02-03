<script lang="ts">
	import type { Profile } from '$lib/tables/profiles';
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';
	import LoadingIndicator from './loading_indicator.svelte';

	export let user: Profile;
	export let size: string;

	const load_image = async (): Promise<string> => {
		if (user.avatar_path == null) {
		} else {
			let { data, error } = await supabase.storage
				.from('profile_avatars')
				.download(user.avatar_path);

			if (error) {
				console.log(error);
			}

			if (data) {
				return URL.createObjectURL(data);
			}
		}

		return '';
	};

	onMount(async () => {});
</script>

{#if user.avatar_path != null}
	{#await load_image()}
		<LoadingIndicator height={size} width={size} border_radius="50%" />
	{:then url}
		<img class="image_circle" style="height: {size}; width: {size};" src={url} alt="User Avatar" />
	{/await}
{:else}
	<div class="empty_circle" style="height: {size}; width: {size}; font-size: calc({size} / 3)">
		{user.username.substring(0, 2).toUpperCase()}
	</div>
{/if}

<style>
	.image_circle {
		display: flex;
		object-fit: cover;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.empty_circle {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		color: var(--onPrimary);
		background-color: var(--primary);
	}
</style>
