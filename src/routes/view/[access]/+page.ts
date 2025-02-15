/** @type {import('./$types').PageLoad} */

import { json, redirect } from '@sveltejs/kit';
import type { IDocument } from '$lib/types';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { cached_answers } from '../../../store';

export const load: PageLoad = async ({ params, fetch }) => {
	const access = params.access;

	let data = get(cached_answers)[access];

	let fetched = (
		await fetch('/access/' + access, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		}).then((v) => v.json())
	)
	if (!data || data.updated !== fetched.data.updated) {
		if(!data) data = fetched?.data;
		else {
			//TO IMPROVE
			data = fetched?.data;
		}
	}

	if (data) {
		cached_answers.update((v) => {
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
