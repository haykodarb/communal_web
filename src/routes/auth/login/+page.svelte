<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '#lib/components/Button.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';

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
			goto('/my-books');
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="form-page">
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
		<h1>{t('Sign in')}</h1>
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
	.header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 40px;
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
