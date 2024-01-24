import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// server: {
// 	open: process.env.BROWSER='chromium'
// }

export default defineConfig({
	plugins: [sveltekit()]
});
