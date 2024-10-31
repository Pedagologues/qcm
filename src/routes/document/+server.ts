import {
	ensureDocumentType,
	fromDatabase as fromDatabaseWithEditToken,
	toDatabase
} from '$lib/database/DocumentManipulator.js';
import type ILocalDocument from '$lib/types/ILocalDocument.js';
import { json } from '@sveltejs/kit';
import { getConnection } from '../../hooks.server.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const v: ILocalDocument = ensureDocumentType(await request.json());
	if (v.id && v.id != -1) {
		const stored = await fromDatabaseWithEditToken(getConnection(), v.id);

		if (stored?.edit != v.edit) return json({}, { status: 401, statusText: 'Wrong edit token' });
	}

	if (!v.edit) {
		v.edit = 'E' + new Date().getTime().toString(16) + Math.random().toString().substring(2, 10);
	}

	if (!v.view) {
		v.view = 'V' + new Date().getTime().toString(16) + Math.random().toString().substring(2, 10);
	}

	await toDatabase(getConnection(), v);
	return json({ ...v, data: undefined }, { status: 201 });
}

export async function GET({ request }) {
	const v = await request.json();

	if (v.edit) {
		const stored = await fromDatabaseWithEditToken(getConnection(), v.edit);
		return new Response(JSON.stringify(stored));
	}

	const stored = await fromDatabaseWithEditToken(getConnection(), v.id);

	if (stored?.view != v.view) return json({}, { status: 401, statusText: 'Wrong view token' });

	return new Response(JSON.stringify({ ...stored, edit: undefined }));
}
