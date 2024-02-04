<script lang="ts">
	import MoonIcon from '../../assets/icons/moon.svelte';
	import SunIcon from '../../assets/icons/sun.svelte';
	import InvitationsIcon from '../../assets/icons/invitations.svelte';
	import ChatsIcon from '../../assets/icons/chats.svelte';
	import CommunityIcon from '../../assets/icons/community.svelte';
	import ProfileIcon from '../../assets/icons/profile.svelte';
	import BookIcon from '../../assets/icons/book.svelte';
	import SignoutIcon from '../../assets/icons/signout.svelte';
	import LoansIcon from '../../assets/icons/loans.svelte';
	import ToolsIcon from '../../assets/icons/tools.svelte';

	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import CircularAvatar from '../../common/circular_avatar.svelte';
	import { type Profile } from '$lib/tables/profiles';
	import { page } from '$app/stores';
	import { getTheme, theme } from '$lib/stores';

	let current_path: string;
	$: current_path = $page.url.pathname;

	console.log(current_path);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		goto('/');
	};

	const handleNavigation = async (path: string) => {
		await goto(path);
	};

	const changeTheme = async () => {
		theme.set(getTheme() == 'light' ? 'dark' : 'light');
	};
	const getButtonColor = (path: string): string => {
		return path == current_path ? 'var(--primary)' : 'var(--background)';
	};
</script>

<svelte:head>
	<link rel="stylesheet" href={`/themes/${$theme}.css`} />
</svelte:head>

<div class="drawer_container">
	<div class="drawer">
		<!-- <div class="profile_header">
			{#if data.user != undefined && data.user != null}
				<CircularAvatar size={'12.5vh'} user={data.user} />
				<div>{data.user.username}</div>
			{/if}
		</div> -->
		<div></div>

		<button class="drawer_button" on:click={() => handleNavigation('/profile')}>
			<ProfileIcon
				size="3.5vh"
				color={current_path == '/profile' ? 'var(--primary)' : 'var(--onBackground)'}
			/>
			<h2 style="color: {current_path == '/profile' ? 'var(--primary)' : 'var(--onBackground)'}">
				Profile
			</h2>
		</button>

		<button class="drawer_button" on:click={() => handleNavigation('/messages')}>
			<ChatsIcon
				size="3.5vh"
				color={current_path == '/messages' ? 'var(--primary)' : 'var(--onBackground)'}
			/>
			<h2 style="color: {current_path == '/messages' ? 'var(--primary)' : 'var(--onBackground)'}">
				Messages
			</h2>
		</button>

		<button class="drawer_button" on:click={() => handleNavigation('/books')}>
			<BookIcon
				size="3.5vh"
				color={current_path == '/books' ? 'var(--primary)' : 'var(--onBackground)'}
			/>
			<h2 style="color: {current_path == '/books' ? 'var(--primary)' : 'var(--onBackground)'}">
				My Books
			</h2>
		</button>

		<button class="drawer_button" on:click={() => handleNavigation('/tools')}>
			<ToolsIcon
				size="3.5vh"
				color={current_path == '/tools' ? 'var(--primary)' : 'var(--onBackground)'}
			/>
			<h2 style="color: {current_path == '/tools' ? 'var(--primary)' : 'var(--onBackground)'}">
				My Tools
			</h2>
		</button>

		<button class="drawer_button" on:click={() => handleNavigation('/communities')}>
			<CommunityIcon
				size="3.5vh"
				color={current_path == '/communities' ? 'var(--primary)' : 'var(--onBackground)'}
			/>
			<h2
				style="color: {current_path == '/communities' ? 'var(--primary)' : 'var(--onBackground)'}"
			>
				Communities
			</h2>
		</button>

		<button class="drawer_button" on:click={() => handleNavigation('/invitations')}>
			<InvitationsIcon
				size="3.5vh"
				color={current_path == '/invitations' ? 'var(--primary)' : 'var(--onBackground)'}
			/>
			<h2
				style="color: {current_path == '/invitations' ? 'var(--primary)' : 'var(--onBackground)'}"
			>
				Invitations
			</h2>
		</button>

		<button class="drawer_button" on:click={() => handleNavigation('/loans')}>
			<LoansIcon
				size="3.5vh"
				color={current_path == '/loans' ? 'var(--primary)' : 'var(--onBackground)'}
			/>
			<h2 style="color: {current_path == '/loans' ? 'var(--primary)' : 'var(--onBackground)'}">
				Loans
			</h2>
		</button>

		<button class="drawer_button" on:click={changeTheme}>
			{#if $theme == 'light'}
				<MoonIcon size="3.5vh" color="var(--onBackground)" />
				<h2>Dark</h2>
			{:else}
				<SunIcon size="3.5vh" color="var(--onBackground)" />
				<h2>Light</h2>
			{/if}
		</button>

		<div style="flex: 1;" />

		<button class="drawer_button" on:click={handleLogout}>
			<SignoutIcon size="3.5vh" color="var(--onBackground)" />
			<h2>Logout</h2>
		</button>
	</div>
	<slot style="background-color: var(--background); color: var(--onBackground)" />
</div>

<style>
	.drawer_container {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: row;
		justify-content: start;
		background-color: var(--background);
		color: var(--onBackground);
	}

	.drawer {
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: end;
		background-color: white;
		padding-top: 2vh;
		padding-bottom: 2vh;
		min-width: 30vw;
		max-width: 30vw;
		height: 100%;
		box-sizing: border-box;
		background-color: var(--background);
		color: var(--onBackground);
		gap: 3%;
		box-shadow: 0.1vh 0vh 0.5vh 0vh rgba(var(--tertiary-rgb), 0.10) ;
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
		width: 15vw;
		font-size: 1.4vh;
		background: none;
		outline: none;
		border: none;
		color: var(--onBackground);
	}

	.profile_header {
		display: flex;
		flex-direction: row;
		padding-left: 2vw;
		align-items: center;
		font-size: 2.5vh;
		height: 15vh;
		gap: 5%;
		color: var(--onBackground);
	}
</style>
