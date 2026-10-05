<script lang="ts">
	import { goto } from '$app/navigation';
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
	<div class="header">
		<button class="back" type="button" aria-label="Back" onclick={() => goto('/auth/login')}>
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
		<h1>{t('Recover password')}</h1>
	</div>

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
	.header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 40px;
	}
	h1 {
		font-size: 34px;
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
