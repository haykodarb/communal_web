import { get, writable, type Writable } from 'svelte/store'
import type { Book } from './tables/books';

const theme = writable('light');

const getTheme = (): string => {
    return get(theme);
}

export { theme, getTheme };