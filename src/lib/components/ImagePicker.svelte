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
		/** Full width instead of a centered card. */
		fill?: boolean;
		/** A fixed slot height; the width follows `aspect` around it. */
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

	function pick() {
		// Prefer showPicker() (Chrome 99+/Firefox 101+/Safari 16.4+); fall back to
		// click() for older browsers (or ones that balk at a hidden file input).
		if (input.showPicker) {
			try {
				input.showPicker();
				return;
			} catch {
				/* fall through */
			}
		}
		input.click();
	}

	const src = $derived(previewUrl ?? existingUrl);
	// Flutter styles the button as "selected" once a new image is picked.
	const selected = $derived(image !== null);

	// The slot's box, respecting `aspect` (a fixed height drives the width).
	const box = $derived.by(() => {
		if (round) return '';
		if (height) {
			const w = Math.round(height * aspect);
			return fill ? `height:${height}px` : `height:${height}px;width:${w}px`;
		}
		return fill
			? `aspect-ratio:${aspect}`
			: `aspect-ratio:${aspect};width:100%;max-width:${maxWidth}px`;
	});
</script>

<div class="picker" class:round class:fill style={box}>
	{#if src}
		<img {src} alt="" />
	{:else}
		<span class="empty">{t('Add\nimage')}</span>
	{/if}
	{#if !round}{@render pickButton()}{/if}
</div>
<!-- Flutter puts the button under a round avatar rather than over it. -->
{#if round}<div class="below">{@render pickButton()}</div>{/if}
<!-- Not `hidden` (display:none): some browsers refuse to open a picker for it. -->
<input class="file" type="file" accept="image/*" bind:this={input} onchange={onchange} />
{#if error}
	<p class="error-text">{error}</p>
{/if}

{#snippet pickButton()}
	<button type="button" class="pick" class:selected aria-label={t('Add\nimage')} onclick={pick}>
		<Icon name="image" size={24} />
	</button>
{/snippet}

<style>
	.picker {
		position: relative;
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
	}
	.picker.round {
		width: 200px;
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
	.file {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		opacity: 0;
	}
	.error-text {
		margin-top: 6px;
		text-align: center;
		font-size: 13px;
		color: var(--error);
	}
</style>
