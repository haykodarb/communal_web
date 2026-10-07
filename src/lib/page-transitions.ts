import { onNavigate } from '$app/navigation';
import { prefersReducedMotion } from './motion';

// Page transitions with the View Transitions API (CSS in app.css). Going
// deeper (a book, a loan, a chat) slides the new page in from the right, going
// back slides it in from the left, anything else crossfades. Call from a
// layout's script.

/** Paths of the drawer destinations (top-level pages). */
type TopLevel = (path: string) => boolean;

const depth = (path: string) => path.split('/').filter(Boolean).length;

export function pageTransitions(isTopLevel: TopLevel) {
	onNavigate((navigation) => {
		if (!document.startViewTransition || prefersReducedMotion()) return;
		const from = navigation.from?.url.pathname;
		const to = navigation.to?.url.pathname;
		// Tab switches (?tab=) and other same-page updates stay as they are.
		if (!from || !to || from === to) return;

		const back = navigation.type === 'popstate' && (navigation.delta ?? 0) < 0;
		const forward =
			!back && !isTopLevel(to) && (isTopLevel(from) || depth(to) > depth(from));
		const root = document.documentElement;
		root.dataset.nav = back ? 'back' : forward ? 'forward' : 'fade';

		return new Promise<void>((resolve) => {
			const transition = document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
			// The browser may skip the animation (e.g. a hidden tab): the navigation
			// still happens, so just clean up without reporting an error.
			const cleanUp = () => {
				delete root.dataset.nav;
			};
			transition.ready.catch(() => {});
			transition.finished.then(cleanUp, cleanUp);
		});
	});
}
