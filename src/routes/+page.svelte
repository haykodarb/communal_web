<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let login_active: boolean = false;
	let register_active: boolean = false;
	let recovery_active: boolean = false;
	let resend_active: boolean = false;

	let loading: boolean = false;
	let resultMessage: string = '';

	let valid: boolean = false;
	let fields = { username: '', email: '', password: '' };
	let errors = { username: '', email: '', password: '' };

	const handleResendConfirmation = async () => {
		try {
			valid = true;
			let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

			if (!fields.email.match(validRegex)) {
				errors.email = 'Email must be a valid email address.';
				valid = false;
			} else {
				errors.email = '';
			}
			if (valid) {
				loading = true;

				const { data, error } = await supabase.auth.resend({ email: fields.email, type: 'signup' });

				if (error) {
					resultMessage = error.message;
				} else {
					resultMessage = `Confirmation email resent to ${fields.email}`;
				}

				loading = false;
			}
		} catch (error) {
			resultMessage = `${error}`;
		}
	};

	const handlePasswordRecovery = async () => {
		try {
			valid = true;
			let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

			if (!fields.email.match(validRegex)) {
				errors.email = 'Email must be a valid email address.';
				valid = false;
			} else {
				errors.email = '';
			}
			if (valid) {
				loading = true;

				const { data, error } = await supabase.auth.resetPasswordForEmail(fields.email, {
					redirectTo: 'https://communal.ar/recovery'
				});

				if (error) {
					resultMessage = error.message;
				} else {
					resultMessage = `Recovery email sent to ${fields.email}`;
				}

				loading = false;
			}
		} catch (error) {
			resultMessage = `${error}`;
		}
	};

	const handleLogin = async () => {
		try {
			loading = true;

			const { data, error } = await supabase.auth.signInWithPassword({
				email: fields.email,
				password: fields.password
			});

			if (error) {
				resultMessage = error.message;
			} else {
				await goto('/home');
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

	const handleGoBack = () => {
		register_active = false;
		login_active = false;
		resend_active = false;
		recovery_active = false;
		(fields = { email: '', password: '', username: '' }),
			(errors = { email: '', password: '', username: '' }),
			(resultMessage = '');
		loading = false;
		valid = false;
	};
</script>

<div class="container">
	<img class="crow" src="crow_light.png" alt="Crow" />
	<div class="main_column">
		<a class="header" href="/">Communal</a>
		<div class="form_column">
			{#if login_active || register_active || resend_active || recovery_active}
				<button class="text_button" on:click={handleGoBack}>
					{'<'} Go Back
				</button>
				<input
					bind:value={fields.email}
					class="input_field"
					placeholder="Email"
					type="email"
					alt="Email"
				/>
				<div class="error_message">{errors.email}</div>
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
			{/if}

			{#if register_active || login_active}
				<input
					bind:value={fields.password}
					class="input_field"
					placeholder="Password"
					type="password"
					alt="Password"
				/>
				<div class="error_message">{errors.password}</div>
			{/if}

			{#if loading}
				<div class="loader" />
			{:else}
				{#if login_active}
					<button on:click={handleLogin} class="login_button"> Login </button>
				{/if}
				{#if register_active}
					<button class="register_button" on:click={handleRegister}> Register </button>
				{/if}

				{#if recovery_active}
					<button class="register_button" on:click={handlePasswordRecovery}>
						Reset Password
					</button>
				{/if}

				{#if resend_active}
					<button class="register_button" on:click={handleRegister}> Resend </button>
				{/if}

				{#if login_active || register_active || resend_active || recovery_active}
					<div class="error_message" style="font-size: 2.5vh;">{resultMessage}</div>
				{/if}
			{/if}

			{#if !register_active && !login_active && !resend_active && !recovery_active}
				<button on:click={() => (login_active = true)} class="login_button"> Login </button>
				<button on:click={() => (register_active = true)} class="register_button">
					Register
				</button>
				<button
					class="text_button"
					style="font-size: 2vh; align-self: flex-end;"
					on:click={() => (recovery_active = true)}
				>
					Forgot Password?
				</button>

				<button
					class="text_button"
					style="font-size: 2vh; align-self: flex-end;"
					on:click={() => (resend_active = true)}
				>
					Resend confirmation?
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.text_button {
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
		text-align: center;
		width: 25vw;
		max-width: 40vw;
	}

	.input_field {
		height: 5vh;
		width: 90%;
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
		align-items: center;
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
		height: 100%;
		width: 80%;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		gap: 2vh;
	}

	.register_button {
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 6vh;
		width: 100%;
		color: #56949f;
		border: 0.05vh solid;
		background: none;
		border-width: 0.3vh;
		border-radius: 1vh;
		cursor: pointer;
		text-decoration: none;
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
		text-decoration: none;
		background: linear-gradient(to left, #56949f, #907aa9);
		font-weight: 700;
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
