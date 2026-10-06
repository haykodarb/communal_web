<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthHeader from '#lib/components/AuthHeader.svelte';
	import Button from '#lib/components/Button.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { errorMessage as describeError } from '#lib/errors.ts';

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
				goto('/app/my-books');
			} else {
				submitted = true;
			}
		} catch (e) {
			errorMessage = describeError(e);
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
			<Button variant="outlined" onclick={() => goto('/app/auth/login')}>{t('Login')}</Button>
		</div>
	</div>
{:else}
	<div class="form-page">
		<AuthHeader title={t('Create account')} back="/app/auth" />

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
			<div class="row">
				<button type="button" class="link" onclick={() => goto('/app/auth/register/resend')}>
					{t('Resend confirmation')}
				</button>
			</div>
			{#if errorMessage}
				<p class="error">{errorMessage}</p>
			{/if}
			<!-- Flutter: Divider(height: 30) before the button. -->
			<div class="before-submit"></div>
			<Button type="submit" loading={loading}>{t('Register')}</Button>
		</form>
	</div>
{/if}

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 5px;
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
	.row {
		display: flex;
		justify-content: flex-end;
	}
	.link {
		background: none;
		border: none;
		color: var(--secondary);
		font-size: 14px;
		cursor: pointer;
		padding: 0;
	}
	.before-submit {
		height: 25px;
	}
</style>
