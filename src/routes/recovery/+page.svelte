<script lang="ts">
	import { onMount } from 'svelte';
	import type { AuthChangeEvent, AuthSession } from '@supabase/supabase-js';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let newPassword: string;
	let currentState: AuthChangeEvent;

	onMount(() => {
		supabase.auth.onAuthStateChange(async (event, session) => {
			console.log(`New event: ${event}`);

			if (event == 'PASSWORD_RECOVERY') {
				currentState = event;
			} else {
				currentState = 'INITIAL_SESSION';
			}
		});
	});

	const handleSubmit = async () => {
		const { data, error } = await supabase.auth.updateUser({ password: newPassword });

		if (data) console.log('Password updated successfully!');
		if (error) console.log('There was an error updating your password.');
	};
</script>

<body>
	<div class="container">
		<img class="crow" src="crow_light.png" alt="Crow" />
		<div class="main_column">
			<h1 class="header">Communal</h1>
			<div class="form_column">
				<input
					bind:value={newPassword}
					class="input_field"
					placeholder="New Password"
					type="password"
					alt="Password"
				/>
				<div class="login_button">
					<button on:click={handleSubmit} class="login_text">Update</button>
				</div>
			</div>
		</div>
	</div>
</body>

<style>
	.input_field {
		height: 50px;
		width: 350px;
		border: 2px solid #56949f;
		border-radius: 1vh;
		padding-left: 5%;
		padding-right: 5%;
		max-height: 8vh;
		max-width: 60vw;
	}

	.input_field:focus {
		height: 50px;
		width: 350px;
		border: 2px solid #907aa9;
		outline: none;
		border-radius: 1vh;
		padding-left: 5%;
		padding-right: 5%;
		max-height: 8vh;
		max-width: 60vw;
	}

	.login_button {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100px;
		width: 300px;
		min-height: 8vh;
		min-width: 20vw;
		max-height: 8vh;
		max-width: 60vw;
		background-color: #56949f;
		border-radius: 1vh;
	}
	.container {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
		height: 90vh;
		width: 90vw;
		padding: 2vh;
		gap: 5vw;
	}

	.main_column {
		display: flex;
		height: 60vh;
		flex-direction: column;
		align-items: center;
		gap: 2vh;
	}

	.form_column {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: end;
		align-items: center;
		gap: 2vh;
	}

	.login_text {
		color: white;
		cursor: pointer;
		text-decoration: none;
		background-color: transparent;
		border: none;
		text-align: center;
		font-size: 3vh;
	}

	.crow {
		max-height: 60vh;
	}

	.header {
		color: 0xFFFFFF;
		margin: 0;
		background: linear-gradient(to left, #56949f, #907aa9);
		font-family: 'RussoOne';
		font-size: 10vh;
		text-align: center;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	@font-face {
		font-family: 'RussoOne';
		src: url('/fonts/RussoOne-Regular.ttf');
		font-display: swap;
	}
</style>
