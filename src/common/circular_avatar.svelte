<script lang="ts">
	import type { Profile } from '$lib/profiles';
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	export let user: Profile;
	export let size: string;

	let image_url: string | null = null;

	onMount(async () => {
		if (user.avatar_path == null) {
		} else {
			let { data, error } = await supabase.storage
				.from('profile_avatars')
				.download(user.avatar_path);

			if (error) {
				console.log(error);
			}

			if (data) {
				image_url = URL.createObjectURL(data);
			}
		}
	});
</script>

{#if image_url != null}
	<img
		class="image_circle"
		style="height: {size}; width: {size};"
		src={image_url}
		alt="User Avatar"
	/>
{:else}
	<div class="empty_circle" style="height: {size}; width: {size}; font-size: calc({size} / 3)">
		<!-- {user.username.substring(0, 2).toUpperCase()} -->
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
		background-color: #56949f;
	}
</style>
