<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '#lib/components/Button.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Switch from '#lib/components/Switch.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { deleteAccount } from '#lib/data/api.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { currentProfile } from '#lib/profile.svelte.ts';
	import { theme } from '#lib/theme.svelte.ts';

	// Settings: language, theme, change password, delete account. The title is
	// only in the mobile app bar, like the other drawer pages.
	let password = $state('');
	let passwordRepeat = $state('');
	let passwordError = $state('');
	let passwordMessage = $state('');
	let passwordLoading = $state(false);

	let deleteError = $state('');
	let deleteLoading = $state(false);
	let confirmDialog: ConfirmDialog;

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
	<section>
		<h2>{t('Preferences')}</h2>
		<div class="row">
			<span>{t('Language')}</span>
			<Switch value={i18n.locale === 'en'} onchange={i18n.toggle} ariaLabel={t('Change language')}>
				{#snippet left()}EN{/snippet}
				{#snippet right()}ES{/snippet}
			</Switch>
		</div>
		<div class="row">
			<span>{t('Theme')}</span>
			<Switch value={!theme.isDark} onchange={theme.toggle} ariaLabel={t('Toggle theme')}>
				{#snippet left()}<Icon name="sun" size={20} />{/snippet}
				{#snippet right()}<Icon name="moon" size={20} />{/snippet}
			</Switch>
		</div>
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
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		font-size: 16px;
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
