<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '#lib/components/Button.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import PageBar from '#lib/components/PageBar.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { deleteAccount } from '#lib/data/api.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { currentProfile } from '#lib/profile.svelte.ts';

	// Account settings: change email, change password, delete account.
	let email = $state('');
	let emailError = $state('');
	let emailMessage = $state('');
	let emailLoading = $state(false);

	let password = $state('');
	let passwordRepeat = $state('');
	let passwordError = $state('');
	let passwordMessage = $state('');
	let passwordLoading = $state(false);

	let deleteError = $state('');
	let deleteLoading = $state(false);
	let confirmDialog: ConfirmDialog;

	const currentEmail = $derived(auth.user?.email ?? '');
	// Set while a change waits for the link sent to the new address.
	const pendingEmail = $derived(auth.user?.new_email ?? '');

	async function changeEmail() {
		emailMessage = '';
		emailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
			? ''
			: t('Please enter a valid email');
		if (emailError) return;
		emailLoading = true;
		try {
			await auth.updateEmail(email.trim());
			emailMessage = t('Check your inbox: we sent a confirmation link to {email}.').replace(
				'{email}',
				email.trim()
			);
			email = '';
		} catch (e) {
			emailError = errorMessage(e);
		}
		emailLoading = false;
	}

	async function changePassword() {
		passwordMessage = '';
		if (password.length < 6) passwordError = t('Password must be at least 6 characters long');
		else if (!/^[\x00-\x7F]*$/.test(password))
			passwordError = t('Password should only include ASCII characters');
		else if (password !== passwordRepeat) passwordError = t('Passwords do not match');
		else passwordError = '';
		if (passwordError) return;
		passwordLoading = true;
		try {
			await auth.updatePassword(password);
			passwordMessage = t('Password updated.');
			password = '';
			passwordRepeat = '';
		} catch (e) {
			passwordError = errorMessage(e);
		}
		passwordLoading = false;
	}

	async function removeAccount() {
		const profile = currentProfile.value;
		if (!profile || !(await confirmDialog.confirm())) return;
		deleteLoading = true;
		deleteError = '';
		try {
			await deleteAccount(profile);
			await auth.signOut();
			await goto('/auth', { replace: true });
		} catch (e) {
			deleteError = errorMessage(e);
			deleteLoading = false;
		}
	}
</script>

<div class="page">
	<PageBar title={t('Account settings')} mobileTitle />

	<section>
		<h2>{t('Email')}</h2>
		<p class="muted">{currentEmail}</p>
		{#if pendingEmail}
			<p class="muted">{t('Waiting for confirmation of {email}.').replace('{email}', pendingEmail)}</p>
		{/if}
		<TextField
			label={t('New email')}
			type="email"
			autocomplete="email"
			bind:value={email}
			error={emailError}
			onsubmit={changeEmail}
		/>
		{#if emailMessage}<p class="success">{emailMessage}</p>{/if}
		<Button loading={emailLoading} onclick={changeEmail}>{t('Change email')}</Button>
	</section>

	<section>
		<h2>{t('Password')}</h2>
		<TextField
			label={t('New password')}
			type="password"
			autocomplete="new-password"
			bind:value={password}
		/>
		<TextField
			label={t('Repeat password')}
			type="password"
			autocomplete="new-password"
			bind:value={passwordRepeat}
			error={passwordError}
			onsubmit={changePassword}
		/>
		{#if passwordMessage}<p class="success">{passwordMessage}</p>{/if}
		<Button loading={passwordLoading} onclick={changePassword}>{t('Change password')}</Button>
	</section>

	<section class="danger">
		<h2>{t('Delete account')}</h2>
		<p class="muted">
			{t('This deletes your profile, books, loans, messages and friendships. It cannot be undone.')}
		</p>
		{#if deleteError}<p class="error-text">{deleteError}</p>{/if}
		<Button variant="outlined" loading={deleteLoading} onclick={removeAccount}>
			{t('Delete account')}
		</Button>
	</section>
</div>

<ConfirmDialog
	bind:this={confirmDialog}
	title={t('Are you sure you want to delete your account? This is immediate and cannot be undone.')}
/>

<style>
	.page {
		padding: 16px 20px 40px;
		display: flex;
		flex-direction: column;
		gap: 30px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	h2 {
		font-size: 16px;
		font-weight: 600;
		color: var(--secondary);
	}
	/* Destructive section: the outlined button picks up the error color. */
	.danger {
		--primary: var(--error);
	}
	.danger h2 {
		color: var(--error);
	}
	.muted {
		font-size: 14px;
		color: var(--on-surface-variant);
	}
	.success {
		font-size: 14px;
		color: var(--primary);
	}
	.error-text {
		font-size: 14px;
		color: var(--error);
	}
</style>
