import { stored_writable } from '$lib/store';
import { writable, type Writable } from 'svelte/store';

export interface IDocument {
	name: string;
	local_id: number;
	data: string;
	created: Date;
	updated: Date;
	sent?: Date;
	db_id?: number;
	view?: string;
	edit?: string;
}

export const local_documents: Writable<IDocument[]> = stored_writable(
	'documents',
	writable([]),
	(o) => {
		return o.map((v: any) => {
			return {
				...v,
				updated: new Date(v.date),
				created: new Date(v.created)
			} as IDocument;
		});
	}
);
