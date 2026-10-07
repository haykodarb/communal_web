<script lang="ts">
	import { page } from '$app/state';
	import Loading from '#lib/components/Loading.svelte';
	import { goto } from '$app/navigation';
	import PageBar from '#lib/components/PageBar.svelte';
	import Button from '#lib/components/Button.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import ImagePicker from '#lib/components/ImagePicker.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import {
		deleteCommunity,
		getCommunityById,
		leaveCommunity,
		updateCommunity
	} from '#lib/data/api.ts';
	import type { Community } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { validateLength } from '#lib/validate.ts';
	import { errorMessage } from '#lib/errors.ts';

	// CommunitySettingsPage: the owner edits or deletes; everyone else can leave.
	let community = $state<Community | null>(null);
	let name = $state('');
	let description = $state('');
	let avatar = $state<Blob | null>(null);

	let loading = $state(true);
	let saving = $state(false);
	let deleting = $state(false);
	let submitted = $state(false);
	let error = $state('');

	let confirmDialog: ConfirmDialog;
	let confirmTitle = $state('');

	const id = $derived(page.params.id!);
	const userId = $derived(auth.user!.id);
	const isOwner = $derived(community?.owner.id === userId);

	$effect(() => {
		loading = true;
		getCommunityById(id, userId)
			.then((result) => {
				community = result;
				name = result?.name ?? '';
				description = result?.description ?? '';
			})
			.finally(() => (loading = false));
	});

	const edited = $derived(
		community !== null &&
			(name !== community.name || description !== (community.description ?? '') || avatar !== null)
	);
	const nameError = $derived(submitted ? validateLength(name, 4) : '');
	const descriptionError = $derived(submitted ? validateLength(description, 4, true) : '');

	async function confirmed(title: string) {
		confirmTitle = title;
		return confirmDialog.confirm();
	}

	async function save() {
		if (!community || deleting) return;
		submitted = true;
		error = '';
		if (nameError || descriptionError) return;
		saving = true;
		try {
			community = await updateCommunity(
				userId,
				community,
				{ name, description: description || null },
				avatar
			);
			avatar = null;
			submitted = false;
		} catch (e) {
			error = errorMessage(e);
		}
		saving = false;
	}

	async function remove() {
		if (!community) return;
		const title = t('Confirm delete of community {name}?').replace('{name}', community.name);
		if (!(await confirmed(title))) return;
		deleting = true;
		try {
			await deleteCommunity(community);
			await goto('/communities', { replace: true });
		} catch (e) {
			error = errorMessage(e);
			deleting = false;
		}
	}

	async function leave() {
		if (!community) return;
		const title = t('Are you sure you want to leave community {name}?').replace(
			'{name}',
			community.name
		);
		if (!(await confirmed(title))) return;
		try {
			await leaveCommunity(community.id, userId);
			await goto('/communities', { replace: true });
		} catch (e) {
			error = errorMessage(e);
		}
	}
</script>

<div class="page">
	<PageBar title={t('Settings')} />

	{#if loading}
		<Loading />
	{:else if community}
		<form
			class="form"
			novalidate
			onsubmit={(event) => {
				event.preventDefault();
				save();
			}}
		>
			{#if isOwner}
				<ImagePicker
					bind:image={avatar}
					aspect={1}
					maxWidth={320}
					height={300}
					bucket="community_avatars"
					path={community.image_path}
				/>
			{/if}

			<fieldset disabled={!isOwner}>
				<TextField label={t('Name')} bind:value={name} error={nameError} onsubmit={save} />
				{#if isOwner || community.description}
					<TextField
						label={t('Description (Optional)')}
						bind:value={description}
						rows={5}
						error={descriptionError}
					/>
				{/if}
			</fieldset>

			{#if error}
				<p class="error-text">{error}</p>
			{/if}

			{#if isOwner}
				<div class="row">
					<Button type="submit" loading={saving} disabled={!edited}>{t('Save')}</Button>
					<Button variant="outlined" loading={deleting} onclick={remove}>{t('Delete')}</Button>
				</div>
			{:else}
				<Button variant="outlined" onclick={leave}>{t('Leave')}</Button>
			{/if}
		</form>
	{:else}
		<p class="muted">{t('Community not found.')}</p>
	{/if}
</div>

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	.page {
		padding: 10px 20px 40px;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	fieldset {
		margin: 0;
		padding: 0;
		border: none;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	fieldset:disabled {
		opacity: 0.7;
	}
	.row {
		display: flex;
		gap: 20px;
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
