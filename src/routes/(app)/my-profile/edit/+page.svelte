<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import Button from '#lib/components/Button.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import ImagePicker from '#lib/components/ImagePicker.svelte';
	import Switch from '#lib/components/Switch.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { isUsernameAvailable, updateProfile } from '#lib/data/api.ts';
	import type { Profile } from '#lib/data/models.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { currentProfile } from '#lib/profile.svelte.ts';
	import { theme } from '#lib/theme.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';

	let profile = $state<Profile | null>(null);
	let username = $state('');
	let bio = $state('');
	let showEmail = $state(false);
	let avatar = $state<Blob | null>(null);

	let submitted = $state(false);
	let usernameTaken = $state(false);
	let loading = $state(false);
	let error = $state('');

	$effect(() => {
		const userId = auth.user?.id;
		if (!userId) return;
		const seed = (p: Profile | null) => {
			profile = p;
			username = p?.username ?? '';
			bio = p?.bio ?? '';
			showEmail = p?.show_email ?? false;
		};
		// Untracked so a later profile refresh doesn't overwrite in-progress edits.
		const cached = untrack(() => currentProfile.value);
		if (cached?.id === userId) seed(cached);
		else currentProfile.load(userId).then(seed);
	});

	// Mirrors ProfileOwnEditController.usernameValidator / bioValidator.
	const usernameError = $derived.by(() => {
		if (!submitted) return '';
		if (!username) return t('Please enter something');
		if (username.length < 6) return t('Username must be at least 6 characters long');
		if (username.length > 20) return t('Username must be at most 20 characters long');
		if (!/^[\x00-\x7F]*$/.test(username)) return t('Username should only include ASCII characters');
		if (usernameTaken) return t('Username is already taken.');
		return '';
	});
	const bioError = $derived.by(() => {
		if (!submitted || !bio) return '';
		if (bio.length < 20) return t('Bio must be at least 20 characters long');
		return '';
	});

	async function submit() {
		if (!profile) return;
		submitted = true;
		usernameTaken = false;
		error = '';
		if (usernameError || bioError) return;

		loading = true;
		try {
			if (username !== profile.username && !(await isUsernameAvailable(username))) {
				usernameTaken = true;
				loading = false;
				return;
			}
			const updated = await updateProfile(
				profile,
				{ username, bio: bio || null, show_email: showEmail },
				avatar
			);
			currentProfile.set(updated);
			await goto('/my-profile', { replace: true });
		} catch (e) {
			error = errorMessage(e);
			loading = false;
		}
	}
</script>

<div class="page">
	<button class="back" type="button" aria-label={t('Back')} onclick={() => goto('/my-profile')}>
		<Icon name="chevron-left" size={32} />
	</button>
	<h1>{t('Edit profile')}</h1>

	<div class="row">
		<span>{t('Theme')}</span>
		<Switch value={!theme.isDark} onchange={theme.toggle} ariaLabel={t('Toggle theme')}>
			{#snippet left()}<Icon name="sun" size={20} />{/snippet}
			{#snippet right()}<Icon name="moon" size={20} />{/snippet}
		</Switch>
	</div>
	<div class="row">
		<span>{t('Language')}</span>
		<Switch value={i18n.locale === 'en'} onchange={i18n.toggle} ariaLabel={t('Change language')}>
			{#snippet left()}EN{/snippet}
			{#snippet right()}ES{/snippet}
		</Switch>
	</div>

	{#if profile}
		<form
			class="form"
			novalidate
			onsubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			<ImagePicker
				bind:image={avatar}
				aspect={1}
				maxWidth={320}
				bucket="profile_avatars"
				path={profile.avatar_path}
				round
			/>

			<div class="row">
				<span>{t('Show email?')}</span>
				<Switch value={showEmail} onchange={() => (showEmail = !showEmail)} ariaLabel={t('Show email?')}>
					{#snippet left()}<Icon name="check" size={20} />{/snippet}
					{#snippet right()}<Icon name="x" size={20} />{/snippet}
				</Switch>
			</div>

			<div class="fields">
				<TextField
					label={t('Username')}
					bind:value={username}
					maxlength={20}
					error={usernameError}
					oninput={() => (usernameTaken = false)}
					onsubmit={submit}
				/>
				<TextField
					label={t('Bio (Optional)')}
					bind:value={bio}
					rows={3}
					maxlength={1000}
					error={bioError}
				/>
			</div>

			{#if error}
				<p class="error-text">{error}</p>
			{/if}

			<Button type="submit" {loading}>{t('Save')}</Button>
		</form>
	{:else}
		<p class="muted">{t('Loading…')}</p>
	{/if}
</div>

<style>
	.page {
		padding: 16px 20px 40px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.back {
		align-self: flex-start;
		background: none;
		border: none;
		color: var(--on-surface);
		cursor: pointer;
		padding: 0;
	}
	h1 {
		font-size: 32px;
		font-weight: 800;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 16px;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.fields {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.error-text {
		text-align: center;
		font-size: 14px;
		color: var(--error);
	}
	.muted {
		color: var(--on-surface-variant);
	}
</style>
