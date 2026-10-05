<script lang="ts">
	import Icon from './Icon.svelte';
	import { processImage, signedStorageUrl } from '#lib/data/api.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';

	// Image slot with a pick button overlaid at the bottom, like the Flutter
	// create/edit forms. `image` receives the cropped + compressed JPEG.
	let {
		image = $bindable(null),
		aspect,
		maxWidth,
		bucket,
		path,
		round = false,
		fill = false,
		height
	}: {
		image?: Blob | null;
		aspect: number;
		maxWidth: number;
		/** Existing image shown until a new one is picked. */
		bucket?: string;
		path?: string | null;
		round?: boolean;
		/** Full width; height comes from `height` if set, else from `aspect`. */
		fill?: boolean;
		/** Overrides the default slot height (350px, or 200px when round). */
		height?: number;
	} = $props();

	let input: HTMLInputElement;
	let existingUrl = $state<string | null>(null);
	let previewUrl = $state<string | null>(null);
	let error = $state('');

	$effect(() => {
		if (!bucket || !path) return;
		signedStorageUrl(bucket, path).then((url) => (existingUrl = url));
	});

	$effect(() => {
		if (!image) return;
		const url = URL.createObjectURL(image);
		previewUrl = url;
		return () => URL.revokeObjectURL(url);
	});

	async function onchange() {
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		error = '';
		try {
			image = await processImage(file, { aspect, maxWidth });
		} catch (e) {
			error = errorMessage(e);
		}
	}

	const src = $derived(previewUrl ?? existingUrl);
	// Flutter styles the button as "selected" once a new image is picked.
	const selected = $derived(image !== null);
</script>

<div
	class="picker"
	class:round
	class:fill
	style:aspect-ratio={fill && height ? undefined : aspect}
	style:height={height ? `${height}px` : undefined}
>
	{#if src}
		<img {src} alt="" />
	{:else}
		<span class="empty">{t('Add\nimage')}</span>
	{/if}
	{#if !round}{@render pickButton()}{/if}
	<input bind:this={input} type="file" accept="image/*" hidden {onchange} />
</div>
<!-- Flutter puts the button under a round avatar rather than over it. -->
{#if round}<div class="below">{@render pickButton()}</div>{/if}

{#snippet pickButton()}
	<button
		type="button"
		class="pick"
		class:selected
		aria-label={t('Add\nimage')}
		onclick={() => input.click()}
	>
		<Icon name="image" size={24} />
	</button>
{/snippet}
{#if error}
	<p class="error-text">{error}</p>
{/if}

<style>
	.picker {
		position: relative;
		height: 350px;
		max-width: 100%;
		margin: 0 auto;
		border-radius: 5px;
		overflow: hidden;
		background: var(--surface-container);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.picker.fill {
		width: 100%;
		height: auto;
	}
	.picker.round {
		height: 200px;
		border-radius: 50%;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.round img {
		object-fit: cover;
	}
	.empty {
		white-space: pre-line;
		text-align: center;
		font-size: 14px;
		color: var(--on-surface-variant);
	}
	.pick {
		position: absolute;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		padding: 13px;
		border-radius: 10px;
		border: 2px solid transparent;
		background: var(--primary);
		color: var(--on-primary);
		cursor: pointer;
	}
	.below {
		display: flex;
		justify-content: center;
		margin-top: 10px;
	}
	.below .pick {
		position: static;
		transform: none;
	}
	.pick.selected {
		background: var(--surface-container);
		border-color: var(--primary);
		color: var(--primary);
	}
	.error-text {
		margin-top: 6px;
		text-align: center;
		font-size: 13px;
		color: var(--error);
	}
</style>
