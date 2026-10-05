<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '#lib/components/Button.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import { t } from '#lib/i18n.svelte.ts';

	const slides = [
		{ title: 'Upload your books', copy: 'landing-upload-books' },
		{ title: 'Join communities', copy: 'landing-join-communities' },
		{ title: 'Share books', copy: 'landing-share-books' }
	];

	let index = $state(0);

	function next() {
		if (index >= slides.length - 1) {
			goto('/auth');
			return;
		}
		index += 1;
	}
</script>

<div class="landing">
	<div class="container">
		<div class="hero"><Logo size={280} showWordmark={false} /></div>
		<h1>{t(slides[index].title)}</h1>
		<p class="copy">{t(slides[index].copy)}</p>
		<div class="dots">
			{#each slides as _slide, i (i)}
				<span class="dot" class:active={i === index}></span>
			{/each}
		</div>
		<Button onclick={next}>{t('Next')}</Button>
	</div>
</div>

<style>
	.landing {
		min-height: 100vh;
		display: flex;
		align-items: center;
	}
	.hero {
		display: flex;
		justify-content: center;
		margin: 30px 0;
	}
	h1 {
		font-size: 24px;
		font-weight: 600;
		text-align: center;
		color: var(--on-surface-variant);
	}
	.copy {
		margin-top: 20px;
		font-size: 16px;
		font-weight: 500;
		text-align: center;
		color: var(--on-surface-variant);
		min-height: 72px;
	}
	.dots {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin: 30px 0;
	}
	.dot {
		width: 20px;
		height: 20px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--primary) 40%, transparent);
		transition:
			width 200ms ease,
			background-color 200ms ease;
	}
	.dot.active {
		width: 60px;
		background: var(--primary);
	}
</style>
