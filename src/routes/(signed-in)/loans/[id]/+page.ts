import { loan } from '#lib/data/pages.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => ({
	loan: await loan(params.id, depends)
});
