<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let login_active: boolean = false;
	let register_active: boolean = false;

	let loading: boolean = false;
	let resultMessage: string = '';

	let valid: boolean = false;
	let fields = { username: '', email: '', password: '' };
	let errors = { username: '', email: '', password: '' };

	const handleLogin = async () => {
		try {
			loading = true;

			const { data, error } = await supabase.auth.signInWithPassword({
				email: fields.email,
				password: fields.password
			});

			if (error) {
				resultMessage = error.message;
			}

			if (error == null) {
				goto('/home');
			}
			loading = false;

			console.log(data);
		} catch (error) {
			console.log(error);
		}
	};

	const handleRegister = async () => {
		try {
			valid = true;

			if (fields.username.length < 4) {
				errors.username = 'Username must be at least 4 characters long.';
				valid = false;
			} else {
				errors.username = '';
			}

			let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

			if (!fields.email.match(validRegex)) {
				errors.email = 'Email must be a valid email address.';
				valid = false;
			} else {
				errors.email = '';
			}

			if (fields.password.length < 6) {
				errors.password = 'Password must be at least 6 characters long.';
				valid = false;
			} else {
				errors.password = '';
			}

			if (valid) {
				loading = true;

				const { data, error } = await supabase.auth.signUp({
					email: fields.email,
					password: fields.password,
					options: {
						data: {
							username: fields.username
						}
					}
				});
				loading = false;

				if (error) {
					resultMessage = error.message;
				} else {
					resultMessage = `Succesfully signed up, please check you email and click on the confirmation link.`;
				}
				console.log(`Data: ${data}`);
				console.log(`Error: ${error}`);
			}
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
			{#if login_active || register_active}
				<button
					class="go_back_button"
					on:click={() => {
						register_active = false;
						login_active = false;
						fields.username = '';
						fields.email = '';
						fields.password = '';
					}}
				>
					{'<'} Go Back</button
				>
			{/if}
			{#if login_active}
				<input
					bind:value={fields.email}
					class="input_field"
					placeholder="Email"
					type="email"
					alt="Username"
				/>

				<input
					bind:value={fields.password}
					class="input_field"
					placeholder="Password"
					type="password"
					alt="Username"
				/>
				{#if loading}
					<div class="loader" />
				{:else}
					<button on:click={handleLogin} class="login_button"> Login </button>

					<div class="error_message" style="font-size: 2.5vh;">{resultMessage}</div>
				{/if}
			{/if}
			{#if register_active}
				<input
					bind:value={fields.username}
					class="input_field"
					placeholder="Username"
					type="text"
					alt="Username"
				/>
				<div class="error_message">{errors.username}</div>
				<input
					bind:value={fields.email}
					class="input_field"
					placeholder="Email"
					type="email"
					alt="Email"
				/>
				<div class="error_message">{errors.email}</div>
				<input
					bind:value={fields.password}
					class="input_field"
					placeholder="Password"
					type="password"
					alt="Password"
				/>
				<div class="error_message">{errors.password}</div>
				{#if loading}
					<div class="loader" />
				{:else}
					<button class="register_button" on:click={handleRegister}> Register </button>
					<div class="error_message" style="font-size: 2.5vh;">{resultMessage}</div>
				{/if}
			{/if}

			{#if !register_active && !login_active}
				<button on:click={() => (login_active = true)} class="login_button"> Login </button>
				<button on:click={() => (register_active = true)} class="register_button">
					Register
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.go_back_button {
		border: none;
		font-size: 2.5vh;
		align-self: flex-start;
		cursor: pointer;
		color: #56949f;
		font-weight: bold;
		background: none;
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

	.error_message {
		font-size: 2vh;
		text-align: left;
		display: flex;
		flex-direction: row;
		justify-content: start;
		color: #eb6f92;
	}

	.input_field {
		height: 6vh;
		width: 100px;
		min-width: 25vw;
		max-height: 6vh;
		max-width: 50vw;
		border: 0.2vh solid #56949f;
		outline: none;
		border-radius: 1vh;
		padding-left: 5%;
		padding-right: 5%;
		max-height: 8vh;
		max-width: 60vw;
		font-size: 2vh;
	}

	.input_field:focus {
		height: 6vh;
		width: 100px;
		min-width: 25vw;
		max-height: 6vh;
		max-width: 50vw;
		border: 0.3vh solid #907aa9;
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
		height: 6vh;
		width: 100px;
		min-width: 25vw;
		max-height: 6vh;
		max-width: 50vw;
		background-color: #56949f;
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
		padding: 2vh;
		gap: 5vw;
	}

	.main_column {
		display: flex;
		height: 60vh;
		flex-direction: column;
		align-items: center;
		gap: 2vh;
		padding: 5%;
	}

	.form_column {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		gap: 2vh;
	}

	.login_text {
	}

	.register_button {
		display: flex;
		flex-direction: column;
		cursor: pointer;
		justify-content: center;
		height: 6vh;
		width: 100px;
		min-width: 25vw;
		max-height: 6vh;
		max-width: 50vw;
		border-style: solid;
		border-width: 0.25vh;
		border-color: #56949f;
		border-radius: 1vh;

		color: #56949f;
		cursor: pointer;
		text-decoration: none;
		background-color: transparent;
		text-align: center;
		font-size: 3vh;
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
