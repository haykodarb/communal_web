<script lang="ts">
	import { goto } from '$app/navigation';
	import PageBar from '#lib/components/PageBar.svelte';
	import Button from '#lib/components/Button.svelte';
	import ImagePicker from '#lib/components/ImagePicker.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { createCommunity } from '#lib/data/api.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { validateLength } from '#lib/validate.ts';
	import { errorMessage } from '#lib/errors.ts';

	let name = $state('');
	let description = $state('');
	let avatar = $state<Blob | null>(null);

	let submitted = $state(false);
	let loading = $state(false);
	let error = $state('');

	const nameError = $derived(submitted ? validateLength(name, 4) : '');
	const descriptionError = $derived(submitted ? validateLength(description, 4, true) : '');

	async function submit() {
		submitted = true;
		error = '';
		if (nameError || descriptionError) return;

		loading = true;
		try {
			const community = await createCommunity(
				auth.user!.id,
				{ name, description: description || null },
				avatar
			);
			await goto(`/communities/${community.id}`, { replace: true });
		} catch (e) {
			error = errorMessage(e);
			loading = false;
		}
	}
</script>

<div class="page">
	<PageBar title={t('Create community')} mobileTitle />

	<form
		class="form"
		novalidate
		onsubmit={(event) => {
			event.preventDefault();
			submit();
		}}
	>
		<ImagePicker bind:image={avatar} aspect={1} maxWidth={320} fill />

		<div class="fields">
			<TextField label={t('Name')} bind:value={name} error={nameError} onsubmit={submit} />
			<TextField
				label={t('Description (Optional)')}
				bind:value={description}
				rows={5}
				error={descriptionError}
			/>
		</div>

		{#if error}
			<p class="error-text">{error}</p>
		{/if}

		<Button type="submit" {loading}>{t('Create')}</Button>
	</form>
</div>

<style>
	.page {
		padding: 16px 20px 40px;
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
</style>
