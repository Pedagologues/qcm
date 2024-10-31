import { fromDatabaseWithEditToken } from '$lib/database/DocumentManipulator';
import { error } from '@sveltejs/kit';
import { getConnection } from '../../hooks.server';

/** @type {import('./$types').PageLoad} */
export async function load({ params }: any) {
	const token = params.token;

	if (token[0] === 'E') {
		try {
			const doc = await fromDatabaseWithEditToken(getConnection(), token);
			return { doc };
		} catch (e) {
			error(404);
		}
	}

	error(404);
}
