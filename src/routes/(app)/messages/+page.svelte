<script lang="ts">
	import { getCurrentUserId } from '$lib/supabase';
	import { getDistinctChats } from '$lib/tables/messages';
	import { format } from 'date-fns/format';
	import CircularAvatar from '../../../common/circular_avatar.svelte';
	import LoadingIndicator from '../../../common/loading_indicator.svelte';

	const loading_cards: number[] = [1, 2, 3];

	export let data;
</script>

<div class="chats_list">
	{#await getDistinctChats()}
		{#each loading_cards as num}
			<div class="chat_card"></div>
		{/each}
	{:then chats}
		{#if chats.result != null}
			{#each chats.result as chat}
				{#if data.user != null}
					{@const chatter =
						chat.sender == data.user.id ? chat.receiver_profile : chat.sender_profile}

					<div class="chat_card">
						<div class="avatar_container">
							<CircularAvatar size="8vh" user={chatter} />
						</div>

						<div class="name_column">
							<div class="username">{chatter.username}</div>
							<div class="content">{chat.content}</div>
						</div>
						<div style="flex: 1;" />
						<div class="date">{format(new Date(chat.created_at ?? ''), 'E, MMM d')}</div>
					</div>
				{/if}
			{/each}
		{/if}
	{/await}
</div>

<style>
	.chats_list {
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

	.chat_card {
		display: flex;
		flex-direction: row;
		align-items: start;
		justify-content: start;
		width: 40%;
		height: 8vh;
		box-shadow: 0 0.25vh 0.5vh 0 rgba(var(--tertiary-rgb), 0.25);
		border-radius: 1vh;
		transition: 0.3s;
		overflow: hidden;
		cursor: pointer;
		gap: 1vw;
		box-sizing: content-box;
		padding: 3vh;
        background-color: rgba(var(--tertiary-rgb), 0.05);
	}

	.avatar_container {
		height: 8vh;
		width: 8vh;
	}

	/* On mouse-over, add a deeper shadow */
	.chat_card:hover {
		box-shadow: 0 0.5vh 1vh 0 rgba(var(--tertiary-rgb), 0.25);
	}

	.name_column {
		height: 100%;
		max-width: 50%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.username {
		font-size: 2.5vh;
	}

	.content {
		font-size: 1.5vh;
		height: 2vh;
		white-space: nowrap;
		overflow: hidden;
		text-wrap: nowrap;
		text-overflow: ellipsis;
        color: rgba(var(--onSurface-rgb), 0.8);
	}

	.date {
		font-size: 1.5vh;
		min-width: 20%;
        color: rgba(var(--onSurface-rgb), 0.8);
	}
</style>
