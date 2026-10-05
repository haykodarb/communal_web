import { defineEnvVars } from '@sveltejs/kit/env';

// Environment variables available to the client via `$app/env/public`.
// `static: true` inlines the build-time value into the bundle.
export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: {
		public: true,
		static: true,
		description: 'Supabase project URL'
	},
	PUBLIC_SUPABASE_ANON_KEY: {
		public: true,
		static: true,
		description: 'Supabase anon (public) API key'
	}
});
