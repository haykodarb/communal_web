<script lang="ts">
	import { getCommunitiesWhereUserIsMember, getCommunityAvatar } from '$lib/tables/communities';
	import LoadingIndicator from '../../../common/loading_indicator.svelte';
</script>

<div class="community_list">
	{#await getCommunitiesWhereUserIsMember()}
		<div>Loading</div>
	{:then data}
		{#if data.result != null}
			{#each data.result as community}
				<div class="community_card">
					<div class="cover_container">
						{#await getCommunityAvatar(community)}
							<LoadingIndicator height="100%" width="100%" border_radius="0px" />
						{:then value}
							{#if value.result != null}
								<img
									src={URL.createObjectURL(value.result)}
									class="community_avatar"
									alt="Image for {community.name}"
								/>
							{/if}
						{/await}
					</div>
					<div class="community_name">{community.name}</div>
				</div>
			{/each}
		{/if}
	{/await}
</div>

<style>
	.community_list {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: start;
		overflow: scroll;
		box-sizing: border-box;
		padding: 2%;
		gap: 2%;
		color: var(--onBackground) !important;
	}

	.community_card {
		display: flex;
		flex-direction: column;
		justify-content: start;
		width: 40%;
        min-height: 40vh;
		box-shadow: 0 0.25vh 0.5vh 0 rgba(var(--tertiary-rgb), 0.25);
		border-radius: 1vh;
		transition: 0.3s;
        overflow: hidden;
		cursor: pointer;
	}

	/* On mouse-over, add a deeper shadow */
	.community_card:hover {
		box-shadow: 0 0.5vh 1vh 0 rgba(var(--tertiary-rgb), 0.25);
	}

	.cover_container {
		aspect-ratio: 4/3;
        max-height: 80%;
        object-fit: cover;
	}

	.community_avatar {
		height: 100%;
		width: 100%;
	}

	.community_name {
        display: flex;
        flex-direction: column;
        justify-content: center;
		height: 100%;
        text-align: center;
        vertical-align: middle;
        font-size: 2vh;
		flex: 1;
		padding: 2%;
		gap: 5%;
	}
</style>
