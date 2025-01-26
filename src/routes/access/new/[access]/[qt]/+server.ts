/** @type {import('./$types').PageLoad} */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { IDocument } from '$lib/types';
import { newReadAccess } from '$lib/server/accessor';

export const POST: RequestHandler<{ access: string; qt: string }> = async ({ params, request }) => {
	const write_access = params.access;
	const qt = Number.parseInt(params.qt);

	try {
		let read_access = [];
		for (let i = 0; i < qt; i++) {
			read_access.push(newReadAccess(write_access));
		}

		return json({ data: read_access });
	} catch (e) {
		return json(e);
	}
};
