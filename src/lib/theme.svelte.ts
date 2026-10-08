export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'communal-theme';

// Mirrors --surface for each theme (app.css); kept here so the meta tag can be
// updated without waiting on a stylesheet to parse. Also duplicated, as plain
// strings, in app.html's inline script (which can't import this module).
const SURFACE: Record<ThemeMode, string> = {
	light: '#f2e9e1',
	dark: '#1a1825'
};

function systemTheme(): ThemeMode {
	if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'dark';
	}
	return 'light';
}

function readInitial(): ThemeMode {
	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'light' || stored === 'dark') return stored;
	}
	return systemTheme();
}

let mode = $state<ThemeMode>(readInitial());

/** Updates the document and the address bar colour; never touches storage. */
function applyToDom(next: ThemeMode): void {
	if (typeof document !== 'undefined') {
		document.documentElement.dataset.theme = next;
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', SURFACE[next]);
	}
}

function persist(next: ThemeMode): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, next);
	}
}

export const theme = {
	get value(): ThemeMode {
		return mode;
	},
	get isDark(): boolean {
		return mode === 'dark';
	},
	/** An explicit user choice: applied and persisted, overriding the system. */
	set(next: ThemeMode): void {
		mode = next;
		applyToDom(next);
		persist(next);
	},
	toggle(): void {
		const next: ThemeMode = mode === 'light' ? 'dark' : 'light';
		mode = next;
		applyToDom(next);
		persist(next);
	},
	/** Syncs the DOM to the current state (mount); does not persist, so an
	 *  unset preference keeps following the system on the next visit. */
	apply(): void {
		applyToDom(mode);
	}
};
