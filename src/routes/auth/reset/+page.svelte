<script lang="ts">
	import { goto } from '$app/navigation';
	import Loading from '#lib/components/Loading.svelte';
	import AuthHeader from '#lib/components/AuthHeader.svelte';
	import Button from '#lib/components/Button.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';

	// PasswordResetPage: the password-recovery email links here. The Supabase
	// client exchanges the code in the URL for a session on load.
	let password = $state('');
	let passwordError = $state('');
	let message = $state('');
	let done = $state(false);
	let loading = $state(false);

	const linkInvalid = $derived(auth.ready && !auth.session);

	function validate(): string {
		if (!password) return t('Please enter something');
		if (password.length < 6) return t('Password must be at least 6 characters long');
		if (!/^[\x00-\x7F]*$/.test(password)) return t('Password should only include ASCII characters');
		return '';
	}

	async function submit() {
		passwordError = validate();
		if (passwordError) return;
		loading = true;
		message = '';
		try {
			await auth.updatePassword(password);
			done = true;
			message = t('Password updated succesfully, you can now login with your new password.');
			await auth.signOut();
		} catch {
			message = t('Please request a new password reset and follow the link in your email.');
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>{t('Reset password')} · Communal</title>
</svelte:head>

<div class="form-page">
	<AuthHeader title={t('Reset password')} />

	{#if !auth.ready}
		<Loading />
	{:else if done}
		<p class="message">{message}</p>
		<Button onclick={() => goto('/auth/login', { replace: true })}>{t('Login')}</Button>
	{:else if linkInvalid}
		<p class="message failed">{t('Wrong link. Please re-request a password reset.')}</p>
		<Button variant="outlined" onclick={() => goto('/auth/recovery')}>{t('Recover password')}</Button>
	{:else}
		<form
			class="form"
			novalidate
			onsubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			<TextField
				label={t('Password')}
				type="password"
				bind:value={password}
				error={passwordError}
				autocomplete="new-password"
				onsubmit={submit}
			/>
			{#if message}
				<p class="message failed">{message}</p>
			{/if}
			<Button type="submit" {loading}>{t('Send')}</Button>
		</form>
	{/if}
</div>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 30px;
	}
	.message {
		margin-bottom: 20px;
		font-size: 15px;
		white-space: pre-line;
	}
	.message.failed {
		color: var(--error);
	}
</style>
