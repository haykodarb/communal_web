<script lang="ts">
	import AuthHeader from '#lib/components/AuthHeader.svelte';
	import Button from '#lib/components/Button.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { errorMessage as describeError } from '#lib/errors.ts';

	let email = $state('');
	let emailError = $state('');
	let errorMessage = $state('');
	let loading = $state(false);
	let sent = $state(false);

	const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

	async function submit() {
		errorMessage = '';
		emailError = emailPattern.test(email) ? '' : t('form-invalid-email');
		if (emailError !== '') return;
		loading = true;
		try {
			await auth.resetPassword(email);
			sent = true;
		} catch (e) {
			errorMessage = describeError(e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="form-page">
	<AuthHeader title={t('Recover password')} />

	{#if sent}
		<div class="sent">
			<p class="note">{t('A confirmation link has been sent to:')}</p>
			<p class="email">{email}</p>
		</div>
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
				label={t('Email')}
				type="email"
				bind:value={email}
				error={emailError}
				autocomplete="email"
				onsubmit={submit}
			/>
			{#if errorMessage}
				<p class="error">{errorMessage}</p>
			{/if}
			<Button type="submit" loading={loading}>{t('Submit')}</Button>
		</form>
	{/if}
</div>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.error {
		color: var(--error);
		font-size: 15px;
	}
	.sent {
		text-align: center;
	}
	.note {
		font-size: 18px;
	}
	.email {
		margin-top: 20px;
		font-size: 18px;
		font-weight: 600;
		color: var(--tertiary);
	}
</style>
