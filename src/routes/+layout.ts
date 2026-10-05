// Supabase auth is handled entirely on the client, so disable SSR and run as an
// SPA. The static adapter emits an index.html fallback for client-side routing.
export const ssr = false;
export const prerender = false;
