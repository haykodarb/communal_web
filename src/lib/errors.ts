/**
 * A displayable message for anything thrown. Supabase's PostgrestError is a
 * plain object with `message`, not an Error, so String(e) would give "[object Object]".
 */
export function errorMessage(e: unknown): string {
	if (e instanceof Error) return e.message;
	if (e && typeof e === 'object' && 'message' in e) return String(e.message);
	return String(e);
}
