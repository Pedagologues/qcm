/** @type {import('./$types').PageLoad} */

import { json, redirect } from '@sveltejs/kit';
import type { IDocument } from '../../../../lib/types';
import { cached_documents, cached_documents_reads } from '../../../../store';
import { get } from 'svelte/store';
import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const access = params.access;

	let data = get(cached_documents)[access];

	if (!data) {
		const object = await fetch('/access/' + access, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		}).then((v) => v.json());

		data = object?.data;

		cached_documents_reads.update((v) => {
			v[access] = object?.reads || [];
			return v;
		});
	}

	if (data) {
		cached_documents.update((v) => {
			v[access] = data;
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
