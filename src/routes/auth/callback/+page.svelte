<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '#lib/supabase.ts';

	onMount(() => {
		// The Supabase client exchanges the OAuth code from the URL here.
		void (async () => {
			await supabase.auth.getSession();
			await goto('/my-books');
		})();
	});
</script>

<div class="container">Signing you in…</div>
