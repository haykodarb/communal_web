<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Button from '#lib/components/Button.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { createTopic } from '#lib/data/api.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { validateLength } from '#lib/validate.ts';

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
			await goto(`/communities/${id}/discussions/${topic.id}`, { replace: true });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			loading = false;
		}
	}
</script>

<div class="page">
	<header class="bar">
		<button class="back" type="button" aria-label={t('Back')} onclick={() => goto(`/communities/${id}?tab=discuss`)}>
			<Icon name="chevron-left" size={28} />
		</button>
		<h1>{t('Create topic')}</h1>
	</header>

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
		<Button type="submit" {loading}>{t('Create')}</Button>
	</form>
</div>

<style>
	.page {
		padding: 10px 20px 40px;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
	}
	.back {
		display: flex;
		padding: 4px;
		border: none;
		background: none;
		color: var(--on-surface);
		cursor: pointer;
	}
	h1 {
		font-size: 20px;
		font-weight: 600;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.error-text {
		font-size: 14px;
		color: var(--error);
	}
</style>
