import { loadAccess, loadDocument, newAccess, saveDocument } from '.';
import type { IQCMQuestionSection } from '../types';
import type { IDocument, IDocumentAccess } from '$lib/types';
import { appendReadToWrite } from './database/access';

export function saveWithAccess(access_id: string, doc: IDocument) {
	const access = loadAccess(access_id);

	if (!access) throw new Error('Could not recognize access');
	if (access.permission != 'write') throw new Error('Does not have permission to write');

	saveDocument(doc);
}

export function loadWithAccess(
	access_id: string
): { document: IDocument; read: string[] } | undefined {
	const access = loadAccess(access_id);

	if (!access) throw new Error('Could not recognize access');

	let document = loadDocument(access.document_id);
	if (!document) throw new Error('Could not find document');

	// Remove answer if permission is read
	if (access.permission === 'read')
		document = {
			...document,
			data: {
				...document.data,
				sections: document.data.sections.map((v) => {
					if (v.type === 'question') {
						const question_section = v as IQCMQuestionSection;
						return {
							...question_section,
							questions: question_section.questions.map((v) => {
								return { ...v, answer: false };
							})
						};
					}
					return v;
				})
			}
		};

	return { document, read: access.reads || [] };
}

export function newReadAccess(access_id: string): IDocumentAccess {
	const access = loadAccess(access_id);
	if (!access) throw new Error('Could not recognize access');

	let document = loadDocument(access.document_id);
	if (!document) throw new Error('Could not find document');

	const new_access = newAccess(document.id, 'read');

	appendReadToWrite(access_id, new_access.id);

	return new_access;
}
