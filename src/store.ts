import { writable, type Writable } from 'svelte/store';
import type { IDocument } from './lib/types';
import { stored_writable } from './lib/store';

export const cached_documents: Writable<{ [key: string]: IDocument }> = stored_writable(
	'documents',
	writable({})
);

export const cached_documents_reads: Writable<{
	[key: string]: { access: string; alias: string }[];
}> = stored_writable('document_reads', writable({}));
