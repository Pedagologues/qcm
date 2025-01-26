/** @type {import('./$types').PageLoad} */

import { json, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
	return redirect(307, url + '/editor');
};
