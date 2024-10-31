import { ensureDocumentType, fromDatabase, toDatabase } from '$lib/database/DocumentManipulator.js';
import type ILocalDocument from '$lib/types/ILocalDocument.js';
import { json } from '@sveltejs/kit';
import { getConnection } from '../../hooks.server.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const v: ILocalDocument = ensureDocumentType(await request.json());
	await toDatabase(getConnection(), v);
	return json({ id: v.id }, { status: 201 });
}

export async function GET({ request }) {
	const { id } = await request.json();
	return new Response(JSON.stringify(await fromDatabase(getConnection(), id)));
}
