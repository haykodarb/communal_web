import { get, writable } from 'svelte/store'

const theme = writable('light');

const getTheme = (): string => {
    return get(theme);
}

export { theme, getTheme };