import { browser } from '$app/environment';
import { ensureDocumentType } from '$lib/database/DocumentManipulator';
import type IDocument from '$lib/types/IDocument';
import type ILocalDocument from '$lib/types/ILocalDocument';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { local_documents } from '../../store';

/** @type {import('./$types').PageLoad} */
export async function load({ params, data }: any): Promise<{ doc?: IDocument; edit: boolean }> {
	let { doc: raw_db_doc, edit } = data;
	if (browser && edit) {
		const newId =
			get(local_documents)
				.map((v) => v.local_id)
				.reduce((x, y) => (x > y ? x : y), 0) + 1;

		const doc: ILocalDocument = {
			...ensureDocumentType(raw_db_doc),
			sent: new Date(),
			local_id: newId
		};

		local_documents.set(
			get(local_documents)
				.filter((v) => v.id == -1 || v.id != doc.id)
				.concat(doc)
		);

		redirect(303, '/');
	}

	return {
		doc: raw_db_doc,
		edit
	};
}
