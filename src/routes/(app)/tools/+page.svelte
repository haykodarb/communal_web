<script lang="ts">
	import { getToolImage, getToolsForCurrentUser, type Tool } from '$lib/tables/tools';
	import LoadingIndicator from '../../../common/loading_indicator.svelte';

	const loading_cards: number[] = [1, 2, 3];
</script>

<div class="tool_list">
	{#await getToolsForCurrentUser()}
		{#each loading_cards as num}
			<div class="tool_card">
				<div class="cover_container">
					<LoadingIndicator height="100%" width="100%" border_radius="0px" />
				</div>
				<div class="tool_info">
					<LoadingIndicator height="10%" width="80%" border_radius="0.5vh" />
					<LoadingIndicator height="5%" width="40%" border_radius="0.5vh" />
				</div>
			</div>
		{/each}
	{:then data}
		{#if data.result != null}
			{#each data.result as tool}
				<div class="tool_card">
					<div class="cover_container">
						{#await getToolImage(tool)}
							<LoadingIndicator height="100%" width="100%" border_radius="0px" />
						{:then value}
							{#if value.result != null}
								<img
									src={URL.createObjectURL(value.result)}
									class="tool_image"
									alt="Cover for {tool.name}"
								/>
							{/if}
						{/await}
					</div>
					<div class="tool_info">
						<div class="name">{tool.name}</div>
						<div>
							<div class="subtitle">Available</div>
							<div>{tool.available ? 'Yes' : 'No'}</div>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	{/await}
</div>

<style>
	.tool_list {
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

	.tool_card {
		display: flex;
		flex-direction: row;
		justify-content: start;
		width: 40%;
		height: 28vh;
		box-shadow: 0 0.25vh 0.5vh 0 rgba(var(--tertiary-rgb), 0.25) ;
		border-radius: 1vh;
		transition: 0.3s;
		overflow: hidden;
		cursor: pointer;
        background-color: rgba(var(--tertiary-rgb), 0.025);
	}

	/* On mouse-over, add a deeper shadow */
	.tool_card:hover {
		box-shadow: 0 0.5vh 1vh 0 rgba(var(--tertiary-rgb), 0.25) ;
	}

	.cover_container {
		aspect-ratio: 3/4;
	}

	.tool_image {
		height: 100%;
		width: 100%;
	}

	.tool_info {
		height: 100%;
		display: flex;
		font-size: 2vh;
		flex-direction: column;
		flex: 1;
		padding: 2%;
		gap: 5%;
	}


	.name {
		font-size: 2.5vh;
		font-weight: 900;
	}

	.subtitle {
		color: var(--secondary);
	}
</style>
