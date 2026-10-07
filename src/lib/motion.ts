import { cubicOut } from 'svelte/easing';
import {
	fade as svelteFade,
	fly as svelteFly,
	scale as svelteScale,
	slide as svelteSlide,
	type FadeParams,
	type FlyParams,
	type ScaleParams,
	type SlideParams
} from 'svelte/transition';

// Svelte's transitions run as Web Animations, which the reduced-motion CSS
// rule in app.css can't reach. These wrappers drop their duration to 0 when
// the system asks for reduced motion, so changes simply happen at once.

export function prefersReducedMotion(): boolean {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const timed = <P extends { duration?: number; delay?: number }>(params: P): P =>
	prefersReducedMotion() ? { ...params, duration: 0, delay: 0 } : params;

export const fade = (node: Element, params: FadeParams = {}) =>
	svelteFade(node, timed({ duration: 150, ...params }));

export const fly = (node: Element, params: FlyParams = {}) =>
	svelteFly(node, timed({ duration: 220, easing: cubicOut, ...params }));

export const scale = (node: Element, params: ScaleParams = {}) =>
	svelteScale(node, timed({ duration: 200, easing: cubicOut, ...params }));

export const slide = (node: Element, params: SlideParams = {}) =>
	svelteSlide(node, timed({ duration: 200, easing: cubicOut, ...params }));

/**
 * The entrance for items appended to a list (infinite scroll): fade in while
 * rising a few pixels, staggered by their position in the new batch.
 */
export const appear = (node: Element, { index = 0 }: { index?: number } = {}) =>
	fly(node, { y: 8, duration: 240, delay: Math.min(index, 8) * 30 });

/**
 * A list item leaving (accepted, removed, deleted): fade out while the space
 * it took collapses, so the rows below glide up instead of jumping.
 */
export function leave(node: Element) {
	const fading = fade(node, { duration: 120 });
	const collapsing = slide(node, { duration: 200 });
	return {
		delay: 0,
		duration: Math.max(fading.duration ?? 0, collapsing.duration ?? 0),
		easing: collapsing.easing,
		css: (t: number, u: number) => `${fading.css?.(t, u) ?? ''};${collapsing.css?.(t, u) ?? ''}`
	};
}

/**
 * `use:fadeInWhenLoaded` on an <img>: fades it in once it has loaded instead
 * of popping in over its placeholder. Images the browser already has (cached,
 * or loaded before mount) show at once, so going back doesn't flicker.
 */
export function fadeInWhenLoaded(img: HTMLImageElement) {
	if (img.complete && img.naturalWidth > 0) return;
	img.style.opacity = '0';
	const show = () => {
		img.style.transition = 'opacity 200ms ease';
		img.style.removeProperty('opacity');
	};
	img.addEventListener('load', show, { once: true });
	img.addEventListener('error', show, { once: true });
	return {
		destroy() {
			img.removeEventListener('load', show);
			img.removeEventListener('error', show);
		}
	};
}

/**
 * Plays an exit animation started by `className` (CSS), then calls `done`.
 * Falls back to a timeout: animations don't run in a hidden tab, so their end
 * event may never come, and the element must not get stuck half-closed.
 */
export function afterExitAnimation(
	el: HTMLElement,
	className: string,
	done: () => void,
	timeout = 400
) {
	if (prefersReducedMotion()) return done();
	let finished = false;
	const finish = () => {
		if (finished) return;
		finished = true;
		el.removeEventListener('animationend', onEnd);
		clearTimeout(timer);
		el.classList.remove(className);
		done();
	};
	const onEnd = (event: Event) => {
		if (event.target === el) finish();
	};
	el.addEventListener('animationend', onEnd);
	const timer = setTimeout(finish, timeout);
	el.classList.add(className);
}
