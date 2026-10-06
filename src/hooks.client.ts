import type { HandleClientError } from '@sveltejs/kit/hooks';
import { errorMessage } from '#lib/errors.ts';

// Errors thrown while loading a page (usually a failed Supabase request) show
// their own message on the error page instead of a generic "Internal Error".
// SvelteKit's own errors (a 404, say) keep theirs.
export const handleError: HandleClientError = ({ kind, error }) => ({
	message: kind === 'framework' ? error.message : errorMessage(error)
});
