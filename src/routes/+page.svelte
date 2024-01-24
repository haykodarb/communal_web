<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	let login_active: boolean = false;
	let register_active: boolean = false;

	let username: string = '';
	let email: string = '';
	let password: string = '';

	const handleLogin = async () => {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email,
				password: password
			});

			if (error == null) {
				goto('/home');
			}

			console.log(data);
		} catch (error) {
			console.log(error);
		}
	};

	const handleRegister = async () => {
		try {
			const { data, error } = await supabase.auth.signUp({
				email: email,
				password: password,
				options: {
					data: {
						username: username
					}
				}
			});

			console.log(`Data: ${data}`);
			console.log(`Error: ${error}`);
		} catch (error) {
			console.log(error);
		}
	};
</script>

<div class="container">
	<img class="crow" src="crow_light.png" alt="Crow" />
	<div class="main_column">
		<h1 class="header">Communal</h1>
		<div class="form_column">
			{#if login_active}
				<input
					bind:value={email}
					class="input_field"
					placeholder="Email"
					type="email"
					alt="Username"
				/>
				<input
					bind:value={password}
					class="input_field"
					placeholder="Password"
					type="password"
					alt="Username"
				/>
				<div class="login_button">
					<button on:click={handleLogin} class="login_text">Login</button>
				</div>
			{/if}
			{#if register_active}
				<input
					bind:value={username}
					class="input_field"
					placeholder="Username"
					type="text"
					alt="Username"
				/>
				<input
					bind:value={email}
					class="input_field"
					placeholder="Email"
					type="email"
					alt="Email"
				/>
				<input
					bind:value={password}
					class="input_field"
					placeholder="Password"
					type="password"
					alt="Password"
				/>
				<div class="register_button">
					<button on:click={handleRegister} class="register_text">Register</button>
				</div>
			{/if}

			{#if !register_active && !login_active}
				<div class="login_button">
					<button on:click={() => (login_active = true)} class="login_text">Login</button>
				</div>
				<div class="register_button">
					<button on:click={() => (register_active = true)} class="register_text">Register</button>
				</div>
			{/if}
		</div>
	</div>
</div>

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
		width: 400px;
		min-height: 8vh;
		min-width: 30vw;
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
		font-size: 4vh;
	}

	.register_text {
		color: #56949f;
		cursor: pointer;
		text-decoration: none;
		background-color: transparent;
		border: none;
		text-align: center;
		font-size: 4vh;
	}

	.register_button {
		display: flex;
		flex-direction: column;
		cursor: pointer;
		justify-content: center;
		height: 100px;
		width: 400px;
		min-height: 8vh;
		min-width: 30vw;
		max-height: 8vh;
		max-width: 60vw;
		border-style: solid;
		border-width: 0.25vh;
		border-color: #56949f;
		border-radius: 1vh;
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
