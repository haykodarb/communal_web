<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import PageBar from '#lib/components/PageBar.svelte';
	import Button from '#lib/components/Button.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { createTopic } from '#lib/data/api.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { validateLength } from '#lib/validate.ts';
	import { errorMessage } from '#lib/errors.ts';

	// CommunityDiscussionsTopicCreatePage.
	let name = $state('');
	let submitted = $state(false);
	let loading = $state(false);
	let error = $state('');

	const id = $derived(page.params.id!);
	const nameError = $derived(submitted ? validateLength(name, 4) : '');

	async function submit() {
		submitted = true;
		error = '';
		if (nameError) return;
		loading = true;
		try {
			const topic = await createTopic(auth.user!.id, id, name);
			await goto(`/app/communities/${id}/discussions/${topic.id}`, { replace: true });
		} catch (e) {
			error = errorMessage(e);
			loading = false;
		}
	}
</script>

<div class="page">
	<PageBar title={t('Create topic')} onback={() => goto(`/app/communities/${id}?tab=discuss`)} />

	<form
		class="form"
		novalidate
		onsubmit={(event) => {
			event.preventDefault();
			submit();
		}}
	>
		<TextField label={t('Name')} bind:value={name} error={nameError} onsubmit={submit} />
		{#if error}
			<p class="error-text">{error}</p>
		{/if}
		<!-- Flutter: a compact centered button (expand: false). -->
		<div class="submit"><Button type="submit" expand={false} {loading}>{t('Create')}</Button></div>
	</form>
</div>

<style>
	.page {
		padding: 10px 20px 40px;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.submit {
		display: flex;
		justify-content: center;
	}
	.error-text {
		font-size: 14px;
		color: var(--error);
	}
</style>
