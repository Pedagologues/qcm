/** @type {import('./$types').PageLoad} */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { IDocument, IQCMDocument } from '../../../lib/types';
import { loadWithAccess, saveWithAccess } from '../../../lib/server/accessor';

export const POST: RequestHandler<{ access: string }> = async ({ params, request }) => {
	const access = params.access;
	const data = await request.json().then((v) => v as IDocument);

	try {
		if (!(data satisfies IDocument)) throw new Error('Wrong data value');

		saveWithAccess(access, data);
	} catch (e) {
		return json(e);
	}

	return json({ ok: 1 });
};

export const GET: RequestHandler<{ access: string }> = async ({ params }) => {
	const access = params.access;

	try {
		return json({ data: loadWithAccess(access) });
	} catch (e) {
		return json(e);
	}
};
