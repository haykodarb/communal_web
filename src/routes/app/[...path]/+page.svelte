<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	// The app used to live under /app. Old links (bookmarks, the installed app's
	// start page, auth emails already sent) go to the same page without the
	// prefix, keeping the query and the hash (which a load can't read); bare
	// /app goes to Home.
	onMount(() => {
		const path = page.params.path || 'home';
		goto(`/${path}${location.search}${location.hash}`, { replaceState: true });
	});
</script>
