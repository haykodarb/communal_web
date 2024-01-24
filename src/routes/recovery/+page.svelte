<script lang="ts">
	import { onMount } from 'svelte';
	import type { AuthChangeEvent, AuthSession } from '@supabase/supabase-js';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let newPassword: string;
	let currentState: AuthChangeEvent;

	onMount(() => {
		supabase.auth.onAuthStateChange(async (event, session) => {
			if (event == 'PASSWORD_RECOVERY') {
				currentState = event;
			} else {
				currentState = 'INITIAL_SESSION';
			}
		});
	});

	const handleSubmit = async () => {
		if (currentState == 'PASSWORD_RECOVERY') {
			const { data, error } = await supabase.auth.updateUser({ password: newPassword });

			if (data) alert('Password updated successfully!');
			if (error) alert('There was an error updating your password.');
		}
	};
</script>

