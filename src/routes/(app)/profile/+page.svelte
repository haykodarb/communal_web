<script lang="ts">
	import { page } from '$app/stores';
	import CircularAvatar from '../../../common/circular_avatar.svelte';

	export let data;
</script>

<div class="container">
	{#if data.user != undefined && data.user != null}
		<div class="row_container">
			<CircularAvatar size="20vh" user={data.user} />
			<div>{data.user.username}</div>
		</div>
		{#if data.user.show_email}
			<div>
				<div style="color: var(--secondary);">Email</div>
				<div>{data.user.email}</div>
			</div>
		{/if}
		{#if data.user.bio != null && data.user.bio.length > 0}
			<div>
				<div style="color: var(--secondary);">Bio</div>
				<div>{data.user.bio}</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: start;
		width: 100%;
		padding: 5%;
		font-size: 2.5vh;
		gap: 5%;
	}

	.row_container {
		display: flex;
		flex-direction: row;
		gap: 2vw;
		align-items: center;
		font-size: 4vh;
	}
</style>
