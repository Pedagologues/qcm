/** @type {import('./$types').PageLoad} */

import { json, redirect } from '@sveltejs/kit';
import type { IDocument } from '../../../../lib/types';
import { cached_documents, cached_documents_reads } from '../../../../store';
import { get } from 'svelte/store';
import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const access = params.access;

	let data = get(cached_documents)[access];
	let reads = get(cached_documents_reads)[access];

	if (!data || !reads) {
		const object = await fetch('/access/' + access, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		}).then((v) => v.json());

		console.log(object.reads);

		data = object?.data;
		reads =
			(object?.reads as string[]).map((v) => {
				return { access: v, alias: '' };
			}) || [];
	}

	if (data) {
		cached_documents.update((v) => {
			v[access] = data;
			return v;
		});

		cached_documents_reads.update((v) => {
			v[access] = reads;
			return v;
		});

		return {
			access: access,
			document: data
		};
	} else {
		return redirect(307, '/error');
	}
};
