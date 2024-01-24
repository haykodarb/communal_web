<script lang="ts">
	import { onMount } from 'svelte';
	import type { AuthSession } from '@supabase/supabase-js';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let session: AuthSession | null;

	onMount(async () => {
		const { data, error } = await supabase.auth.refreshSession();
		session = data.session;
	});

	const handleLogout = async () => {
		await supabase.auth.signOut();
		goto('/');
	};
</script>

<div style="display: flex; flex-direction: column; align-items: center;">
	<h2 style="text-align: center; font-weight: 500;">
		{#if session != null}
			Signed in as {session.user.user_metadata['username']}
		{/if}
		<br />
		<br />
		Web Page is currently in development.
		<br />
		Please use the Android App in the meantime.
	</h2>
	<br />
	<br />
	<button
		on:click={handleLogout}
		style="border: none; background: none; font-size: 30px; color: #56949f; cursor: pointer; font-weight: 800;"
		>Sign Out</button
	>
</div>
