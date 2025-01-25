import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { newAccess, newDocument } from '../../lib/server';

export const POST: RequestHandler<{}> = async ({}) => {
	const doc = newDocument();

	try {
		return json({ data: newAccess(doc.id, 'write') });
	} catch (e) {
		return json(e);
	}
};
