<script lang="ts">
	import { onMount } from 'svelte';
	import type { AuthSession } from '@supabase/supabase-js';
	import { supabase } from '$lib/supabase';

	let session: AuthSession | null;

	onMount(async () => {
		const { data, error } = await supabase.auth.refreshSession();
		session = data.session;
	});

</script>

<body>
	<div style="display: flex; flex-direction: column; align-items: center; width: 40%;">
		<h2 style="text-align: justify; font-weight: 500;">
			{#if session != null}
				Signed in as {session.user.user_metadata['username']}.
			{/if}
			<br />
			<br />
			Web Page is currently in development.
			<br />
			Please use the Android App in the meantime.
		</h2>
	</div>
</body>
