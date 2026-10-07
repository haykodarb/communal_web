<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthHeader from '#lib/components/AuthHeader.svelte';
	import Button from '#lib/components/Button.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { errorMessage as describeError } from '#lib/errors.ts';

	let email = $state('');
	let password = $state('');
	let emailError = $state('');
	let passwordError = $state('');
	let errorMessage = $state('');
	let loading = $state(false);

	const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

	function validate(): boolean {
		emailError = emailPattern.test(email) ? '' : t('form-invalid-email');
		passwordError = password.length >= 6 ? '' : t('form-short-password');
		return emailError === '' && passwordError === '';
	}

	async function submit() {
		errorMessage = '';
		if (!validate()) return;
		loading = true;
		try {
			await auth.signIn(email, password);
			goto('/home');
		} catch (e) {
			errorMessage = describeError(e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="form-page">
	<AuthHeader title={t('Sign in')} />

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
			label={t('Password')}
			type="password"
			bind:value={password}
			error={passwordError}
			autocomplete="current-password"
			onsubmit={submit}
		/>
		<div class="row">
			<button type="button" class="link" onclick={() => goto('/auth/recovery')}>
				{t('Forgot password?')}
			</button>
		</div>
		{#if errorMessage}
			<p class="error">{errorMessage}</p>
		{/if}
		<!-- Flutter: Divider(height: 30) before the button. -->
		<div class="before-submit"></div>
		<Button type="submit" loading={loading}>{t('Login')}</Button>
	</form>
</div>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 5px;
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
	.error {
		color: var(--error);
		font-size: 15px;
	}
	.before-submit {
		height: 25px;
	}
</style>
