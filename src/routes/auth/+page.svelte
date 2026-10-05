<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '#lib/components/Button.svelte';
	import Logo from '#lib/components/Logo.svelte';
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
				{#snippet left()}
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					>
						<circle cx="12" cy="12" r="4" />
						<path
							d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
						/>
					</svg>
				{/snippet}
				{#snippet right()}
					<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
						<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
					</svg>
				{/snippet}
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
