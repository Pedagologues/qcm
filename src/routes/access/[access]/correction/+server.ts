/** @type {import('./$types').PageLoad} */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { correction } from '../../../../lib/server/correction';

export const GET: RequestHandler<{ access: string }> = async ({ params, request }) => {
	const access = params.access;

	try {
		const value = correction(access);
		return json({ data: value });
	} catch (e: any) {
		return json({ error: 1, message: (e as Error).message });
	}
};
