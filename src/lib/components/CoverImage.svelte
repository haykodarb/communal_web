<script lang="ts">
	import Icon from './Icon.svelte';
	import { signedStorageUrl } from '#lib/data/api.ts';

	let {
		bucket,
		path,
		alt = '',
		rounded = false
	}: { bucket: string; path?: string | null; alt?: string; rounded?: boolean } =
		$props();

	let url = $state<string | null>(null);
	let failed = $state(false);

	$effect(() => {
		const p = path;
		failed = false;
		url = null;
		let active = true;
		signedStorageUrl(bucket, p).then((u) => {
			if (!active) return;
			if (u) url = u;
			else failed = true;
		});
		return () => {
			active = false;
		};
	});
</script>

{#if url}
	<img class="cover" class:rounded src={url} {alt} loading="lazy" />
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
