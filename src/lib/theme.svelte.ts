export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'communal-theme';

function readInitial(): ThemeMode {
	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'light' || stored === 'dark') return stored;
	}
	return 'light';
}

let mode = $state<ThemeMode>(readInitial());

function apply(next: ThemeMode): void {
	if (typeof document !== 'undefined') {
		document.documentElement.dataset.theme = next;
	}
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
	set(next: ThemeMode): void {
		mode = next;
		apply(next);
	},
	toggle(): void {
		const next: ThemeMode = mode === 'light' ? 'dark' : 'light';
		mode = next;
		apply(next);
	},
	apply(): void {
		apply(mode);
	}
};
