import {
	fromDatabaseWithEditToken,
	fromDatabaseWithPublicToken
} from '$lib/database/DocumentManipulator';
import type IDocument from '$lib/types/IDocument';
import { error } from '@sveltejs/kit';
import { getConnection } from '../../hooks.server';

/** @type {import('./$types').PageLoad} */
export async function load({ params }: any): Promise<{ doc?: IDocument; edit: boolean }> {
	const token = params.token;

	// Edit token
	if (token[0] === 'E') {
		try {
			let doc = await fromDatabaseWithEditToken(getConnection(), token);
			if (!doc) throw new Error();
			return { doc, edit: true };
		} catch (e) {
			error(404);
		}
	} else if (token[0] == 'V') {
		// View token
		try {
			const doc = await fromDatabaseWithPublicToken(getConnection(), token);
			if (!doc) throw new Error();
			return { doc, edit: false };
		} catch (e) {
			error(404);
		}
	}

	error(404);
}
