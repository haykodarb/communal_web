import { t } from './i18n.svelte';

/** The Flutter forms' stringValidator: required (unless optional) and a minimum length. */
export function validateLength(value: string, length: number, optional = false): string {
	if (!value) return optional ? '' : t('Please enter something');
	if (value.length < length) return t('form-min-length').replace('{n}', String(length));
	return '';
}
