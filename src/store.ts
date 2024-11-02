import { ensureDocumentType } from '$lib/database/DocumentManipulator';
import { stored_writable } from '$lib/store';
import type IAnswer from '$lib/types/IAnswer';
import type ILocalDocument from '$lib/types/ILocalDocument';
import { writable, type Writable } from 'svelte/store';

export const local_documents: Writable<ILocalDocument[]> = stored_writable(
	'documents',
	writable([]),
	(values) => {
		return values.map(ensureDocumentType);
	}
);

export const local_answers: Writable<IAnswer[]> = stored_writable('answers', writable([]));
