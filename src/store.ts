import { ensureDocumentType } from '$lib/database/DocumentManipulator';
import { stored_writable } from '$lib/store';
import type ILocalDocument from '$lib/types/ILocalDocument';
import { writable, type Writable } from 'svelte/store';

export const local_documents: Writable<ILocalDocument[]> = stored_writable(
	'documents',
	writable([]),
	(values) => {
		return values.map(ensureDocumentType);
	}
);
