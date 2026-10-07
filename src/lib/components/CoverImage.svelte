<script lang="ts">
	import Icon from './Icon.svelte';
	import { peekSignedUrl, signedStorageUrl } from '#lib/data/api.ts';
	import { fadeInWhenLoaded } from '#lib/motion.ts';

	let {
		bucket,
		path,
		alt = '',
		rounded = false
	}: { bucket: string; path?: string | null; alt?: string; rounded?: boolean } =
		$props();

	// A URL signed earlier (or presigned by the page's load) shows right away;
	// otherwise it's requested, batched with the other covers on screen.
	let fetched = $state<{ key: string; url: string | null } | null>(null);
	const key = $derived(`${bucket}:${path}`);
	const url = $derived(
		peekSignedUrl(bucket, path) ?? (fetched?.key === key ? fetched.url : null)
	);
	const failed = $derived(fetched?.key === key && fetched.url === null);

	$effect(() => {
		const current = key;
		if (!path || peekSignedUrl(bucket, path)) return;
		let active = true;
		signedStorageUrl(bucket, path).then((u) => {
			if (active) fetched = { key: current, url: u };
		});
		return () => {
			active = false;
		};
	});
</script>

{#if url}
	<img class="cover" class:rounded src={url} {alt} loading="lazy" use:fadeInWhenLoaded />
{:else}
	<div class="cover placeholder" class:rounded>
		{#if !failed}
			<Icon name="image" size={rounded ? 24 : 32} />
		{:else}
			<Icon name="image" size={rounded ? 24 : 32} />
		{/if}
	</div>
{/if}

<style>
	.cover {
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: var(--surface-container);
		display: block;
	}
	.rounded {
		border-radius: 50%;
	}
	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--on-surface-variant);
		opacity: 0.5;
	}
</style>
