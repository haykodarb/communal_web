/** dd/MM/yy, the date format the Flutter app uses on book and loan pages. */
export function formatShortDate(date: string): string {
	return new Intl.DateTimeFormat('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit'
	}).format(new Date(date));
}
