/** @type {import('./$types').PageLoad} */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { IDocument, IDocumentMetadata } from '../../../lib/types';
import { loadWithAccess, saveWithAccess } from '../../../lib/server/accessor';

export const POST: RequestHandler<{ access: string }> = async ({ params, request }) => {
	const access = params.access;
	const data = await request.json().then((v) => v as IDocument & IDocumentMetadata);

	try {
		if (!(data satisfies IDocument & IDocumentMetadata)) throw new Error('Wrong data value');

		saveWithAccess(access, data);
	} catch (e) {
		return json(e);
	}

	return json({ ok: 1 });
};

export const GET: RequestHandler<{ access: string }> = async ({ params }) => {
	const access = params.access;

	try {
		const value = loadWithAccess(access);
		return json({ data: value?.document, reads: value?.read });
	} catch (e) {
		return json(e);
	}
};
