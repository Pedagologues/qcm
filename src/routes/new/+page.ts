/** @type {import('./$types').PageLoad} */

import { json, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { IDocumentAccess } from '../../lib/types';

export const load: PageLoad = async ({ params, fetch }) => {
	const value = await fetch('/new', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		}
	}).then((v) => v.json());

	if (value && value.data) {
		let access = value.data as IDocumentAccess;

		return redirect(307, '/edit/' + access.id);
	}

	return redirect(307, '/error');
};
