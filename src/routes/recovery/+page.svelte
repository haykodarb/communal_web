<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { page } from '$app/stores';

	let newPassword: string;
	let loading: boolean;
	let valid: boolean = false;
	let resultMessage: string;

	onMount(async () => {
		let parsed = new URLSearchParams(`${$page.url.hash.substring(1)}`);
		console.log(`Parsed: ${parsed}`);

		let access_token: string = parsed.get('access_token') || '';
		let refresh_token: string = parsed.get('refresh_token') || '';

		if (access_token.length <= 0 || refresh_token.length <= 0) {
			resultMessage = 'Incorrect link, required parameters were not found.';
		}

		console.log(`Access Token > ${access_token}`);
		console.log(`Refresh Token > ${refresh_token}`);

		loading = true;

		const { data, error } = await supabase.auth.setSession({
			access_token: access_token,
			refresh_token: refresh_token
		});

		if (error) {
			console.log(`Error signing in: ${error.message}`);
		}

		if (data) {
			console.log(`Data: ${data}`);
		}
		loading = false;
	});

	const handleSubmit = async () => {
		try {
			valid = true;

			if (newPassword == undefined || newPassword.length < 6) {
				resultMessage = 'Password needs to be at least 6 characters long.';
				valid = false;
			}

			if (valid) {
				loading = true;

				const { data, error } = await supabase.auth.updateUser({ password: newPassword });

				loading = false;

				if (error) {
					resultMessage = error.message;
				} else {
					resultMessage = "Password updated successfully."
				}
			}
		} catch (error) {
			resultMessage = `${error}`;
		}
	};
</script>

<body>
	<div class="container">
		<img class="crow" src="crow_light.png" alt="Crow" />
		<div class="main_column">
			<a class="header" href="/">Communal</a>
			<div class="form_column">
				<input
					bind:value={newPassword}
					class="input_field"
					placeholder="New Password"
					type="password"
					alt="Password"
				/>
				{#if loading}
					<div class="loader" />
				{:else}
					{#if resultMessage != undefined && resultMessage.length > 0}
						<p class="error_message">{resultMessage}</p>
					{/if}
					<button on:click={handleSubmit} class="login_button">Update</button>
				{/if}
			</div>
		</div>
	</div>
</body>

<style>
	.error_message {
		font-size: 2vh;
		text-align: center;
		width: 25vw;
		max-width: 40vw;
	}

	.loader {
		border: 2vh solid #f3f3f3; /* Light grey */
		border-top: 2vh solid #56949f; /* Blue */
		border-radius: 50%;
		width: 4vh;
		height: 4vh;
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.input_field {
		height: 5vh;
		width: 100%;
		border: 0.2vh solid #907aa9;
		outline: none;
		border-radius: 1vh;
		padding-left: 5%;
		padding-right: 5%;
		font-size: 2vh;
	}

	.input_field:focus {
		border: 0.3vh solid #56949f;
		outline: none;
	}

	.login_button {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 6vh;
		width: 100%;
		background: #56949f;
		border-radius: 1vh;
		color: white;
		cursor: pointer;
		border: none;
		text-decoration: none;
		text-align: center;
		font-size: 3vh;
	}

	.container {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
		height: 90vh;
		width: 90vw;
		gap: 5vw;
	}

	.main_column {
		display: flex;
		height: 60vh;
		min-width: 25vw;
		max-width: 80vw;
		flex-direction: column;
		align-items: center;
		gap: 2vh;
	}

	.form_column {
		display: flex;
		flex: 1;
		width: 80%;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		gap: 2vh;
	}

	.crow {
		min-height: 70vh;
		max-height: 70vh;
	}

	.header {
		color: 0xFFFFFF;
		margin: 0;
		background: linear-gradient(to left, #56949f, #907aa9);
		font-family: 'RussoOne';
		text-decoration: none;
		font-weight: 700;
		font-size: 10vh;
		border: none;
		cursor: pointer;
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
