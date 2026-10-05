<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '#lib/components/Button.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Switch from '#lib/components/Switch.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { theme } from '#lib/theme.svelte.ts';

	let loading = $state(false);

	onMount(() => {
		localStorage.setItem('communal-welcome-seen', 'true');
		if (auth.session) goto('/my-books');
	});

	async function google() {
		loading = true;
		try {
			await auth.signInWithGoogle();
		} catch {
			loading = false;
		}
	}
</script>

<div class="auth">
	<div class="container">
		<div class="topbar">
			<Switch
				value={i18n.locale === 'en'}
				onchange={() => i18n.toggle()}
				ariaLabel={t('Change language')}
			>
				{#snippet left()}EN{/snippet}
				{#snippet right()}ES{/snippet}
			</Switch>

			<Switch
				value={!theme.isDark}
				onchange={() => theme.toggle()}
				ariaLabel={t('Toggle theme')}
			>
				{#snippet left()}<Icon name="sun" size={22} />{/snippet}
				{#snippet right()}<Icon name="moon" size={22} />{/snippet}
			</Switch>
		</div>

		<div class="hero"><Logo size={300} /></div>

		<div class="actions">
			<Button variant="outlined" onclick={() => goto('/auth/login')}>{t('Login')}</Button>
			<Button variant="filled" onclick={() => goto('/auth/register')}>{t('Register')}</Button>
			<Button variant="filled" loading={loading} onclick={google}>
				{t('Enter with Google')}
			</Button>
		</div>
	</div>
</div>

<style>
	.auth {
		min-height: 100vh;
	}
	.container {
		display: flex;
		flex-direction: column;
		gap: 22px;
	}
	.topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.hero {
		display: flex;
		justify-content: center;
		padding: 10px 0;
	}
	.actions {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
</style>
