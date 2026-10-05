<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '#lib/components/Button.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let email = $state('');
	let username = $state('');
	let password = $state('');
	let emailError = $state('');
	let usernameError = $state('');
	let passwordError = $state('');
	let errorMessage = $state('');
	let loading = $state(false);
	let submitted = $state(false);

	const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

	function validate(): boolean {
		emailError = emailPattern.test(email) ? '' : t('form-invalid-email');
		usernameError = username.trim().length >= 3 ? '' : t('form-short-username');
		passwordError = password.length >= 6 ? '' : t('form-short-password');
		return emailError === '' && usernameError === '' && passwordError === '';
	}

	async function submit() {
		errorMessage = '';
		if (!validate()) return;
		loading = true;
		try {
			const hasSession = await auth.signUp(email, password, username);
			if (hasSession) {
				goto('/my-books');
			} else {
				submitted = true;
			}
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	}
</script>

{#if submitted}
	<div class="container confirm">
		<p class="confirm-title">{t('A confirmation link has been sent to:')}</p>
		<p class="confirm-email">{email}</p>
		<p class="confirm-note">{t('Please validate your email and then login.')}</p>
		<div class="confirm-action">
			<Button variant="outlined" onclick={() => goto('/auth/login')}>{t('Login')}</Button>
		</div>
	</div>
{:else}
	<div class="container">
		<div class="header">
			<button class="back" type="button" aria-label="Back" onclick={() => goto('/auth')}>
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M15 18l-6-6 6-6" />
				</svg>
			</button>
			<h1>{t('Create account')}</h1>
		</div>

		<form
			class="form"
			novalidate
			onsubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			<TextField
				label={t('Email')}
				type="email"
				bind:value={email}
				error={emailError}
				autocomplete="email"
			/>
			<TextField
				label={t('Username')}
				bind:value={username}
				error={usernameError}
				autocomplete="username"
			/>
			<TextField
				label={t('Password')}
				type="password"
				bind:value={password}
				error={passwordError}
				autocomplete="new-password"
				onsubmit={submit}
			/>
			{#if errorMessage}
				<p class="error">{errorMessage}</p>
			{/if}
			<Button type="submit" loading={loading}>{t('Register')}</Button>
		</form>
	</div>
{/if}

<style>
	.header {
		display: flex;
		align-items: center;
		gap: 16px;
		padding-top: 60px;
		margin-bottom: 28px;
	}
	h1 {
		font-size: 40px;
		font-weight: 800;
	}
	.back {
		display: inline-flex;
		background: none;
		border: none;
		color: var(--on-surface);
		cursor: pointer;
		padding: 0;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.error {
		color: var(--error);
		font-size: 15px;
	}
	.confirm {
		text-align: center;
		padding-top: 120px;
	}
	.confirm-title {
		font-size: 18px;
	}
	.confirm-email {
		margin: 20px 0;
		font-size: 18px;
		font-weight: 600;
		color: var(--tertiary);
	}
	.confirm-note {
		font-size: 14px;
		color: var(--on-surface-variant);
	}
	.confirm-action {
		margin-top: 40px;
	}
</style>
