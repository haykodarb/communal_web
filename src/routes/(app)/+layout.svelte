<script lang="ts">
	import {
		UilBooks,
		UilCommentsAlt,
		UilEnvelopes,
		UilExchangeAlt,
		UilMoon,
		UilSignOutAlt,
		UilUser,
		UilUsersAlt
	} from 'svelte-unicons';
	import Tools from 'svelte-material-icons/HammerScrewdriver.svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import CircularAvatar from '../../common/circular_avatar.svelte';
	import { type Profile } from '$lib/profiles';

	export let data: Profile ;

	const handleLogout = async () => {
		await supabase.auth.signOut();
		goto('/');
	};
</script>

<div class="drawer_container">
	<div class="drawer">
		<div class="profile_header">
			{#if data != undefined}
				<CircularAvatar size={'15vh'} user={data} />
				<div>{data.username}</div>
			{/if}
		</div>
		<div class="drawer_separator" />
		<div class="drawer_button">
			<UilUser size="4vh" />
			<h2>Profile</h2>
		</div>
		<div class="drawer_separator" />
		<div class="drawer_button">
			<UilCommentsAlt size="4vh" />
			<h2>Messages</h2>
		</div>
		<div class="drawer_separator" />
		<div class="drawer_button">
			<UilBooks size="4vh" />
			<h2>My Books</h2>
		</div>
		<div class="drawer_separator" />
		<div class="drawer_button">
			<Tools size="4vh" />
			<h2>My Tools</h2>
		</div>
		<div class="drawer_separator" />
		<div class="drawer_button">
			<UilUsersAlt size="4vh" />
			<h2>Communities</h2>
		</div>
		<div class="drawer_separator" />
		<div class="drawer_button">
			<UilEnvelopes size="4vh" />
			<h2>Invitations</h2>
		</div>
		<div class="drawer_separator" />
		<div class="drawer_button">
			<UilExchangeAlt size="4vh" />
			<h2>Loans</h2>
		</div>
		<div class="drawer_separator" />

		<div class="drawer_button">
			<UilMoon size="4vh" />
			<h2>Dark</h2>
		</div>
		<div style="flex: 1;" />
		<div class="drawer_separator" />
		<button class="drawer_button" on:click={handleLogout}>
			<UilSignOutAlt size="4vh" />
			<h2>Logout</h2>
		</button>
	</div>
	<slot />
</div>

<style>
	.drawer_container {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: row;
		justify-content: start;
	}

	.drawer {
		display: flex;
		flex-direction: column;
		justify-content: start;
		background-color: white;
		box-shadow: 0px 0px 0px 0.2vh #0002;
		padding-top: 2vh;
		padding-bottom: 2vh;
		min-width: 20vw;
		max-width: 30vw;
		height: 96%;
		gap: 2%;
	}

	.drawer_separator {
		width: 100%;
		height: 0.2vh;
		background-color: #0002;
	}

	.drawer_button {
		display: flex;
		flex-direction: row;
		cursor: pointer;
		justify-content: start;
		align-items: center;
		padding-left: 2vw;
		padding-right: 2vw;
		gap: 5%;
		height: 4vh;
		font-size: 1.5vh;
		background: none;
		outline: none;
		border: none;
	}

	.profile_header {
		display: flex;
		flex-direction: row;
		padding-left: 2vw;
		align-items: center;
		font-size: 2.5vh;
		height: 15vh;
		gap: 5%;
	}
</style>
