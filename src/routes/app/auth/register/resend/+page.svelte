<script lang="ts">
	import AuthHeader from '#lib/components/AuthHeader.svelte';
	import Button from '#lib/components/Button.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';

	// RegisterResendPage: re-send the signup confirmation email.
	let email = $state('');
	let emailError = $state('');
	let message = $state('');
	let failed = $state(false);
	let loading = $state(false);

	const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

	async function submit() {
		message = '';
		emailError = emailPattern.test(email) ? '' : t('form-invalid-email');
		if (emailError) return;
		loading = true;
		try {
			await auth.resendConfirmation(email);
			failed = false;
			message = t('Confirmation email resent. Please check your inbox.');
		} catch {
			failed = true;
			message = t('Server error. Could not resend confirmation email.');
		}
		loading = false;
	}
</script>

<div class="form-page">
	<AuthHeader title={t('Resend confirmation')} back="/app/auth/register" />

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
			onsubmit={submit}
		/>
		{#if message}
			<p class="message" class:failed>{message}</p>
		{/if}
		<Button type="submit" {loading}>{t('Send')}</Button>
	</form>
</div>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 30px;
	}
	.message {
		font-size: 15px;
	}
	.message.failed {
		color: var(--error);
	}
</style>
