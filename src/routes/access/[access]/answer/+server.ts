/** @type {import('./$types').PageLoad} */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { IAnswerMetadata, IDocument, IDocumentMetadata } from '$lib/types';
import { loadWithAccess, retrieveAnswer, saveWithAccess, submitAnswer } from '$lib/server/accessor';

export const POST: RequestHandler<{ access: string }> = async ({ params, request }) => {
	const access = params.access;
	const data = await request.json().then((v) => v as IDocument & IAnswerMetadata);

	try {
		if (!(data satisfies IDocument & IAnswerMetadata)) throw new Error('Wrong data value');

		submitAnswer(access, data);
	} catch (e: any) {
		const err: Error = e;
		return json({
			error: 1,
			message: err.message
		});
	}

	return json({ ok: 1 });
};

export const GET: RequestHandler<{ access: string }> = async ({ params, request }) => {
	const access = params.access;
	const read_access: string = await request.json().then((v) => v.data);

	try {
		const value = retrieveAnswer(access, read_access);
		return json({ data: value });
	} catch (e) {
		return json(e);
	}
};
