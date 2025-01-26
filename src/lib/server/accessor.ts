import { loadAccess, loadAnswer, loadDocument, newAccess, saveAnswer, saveDocument } from '.';
import type { IQCMQuestionSection } from '../types';
import type { IDocument, IDocumentAccess } from '$lib/types';
import { appendReadToWrite } from './database/access';
import { parse_document } from '../parser';

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
	if (access.permission === 'read') {
		const remove_answers = (v: string): string =>
			v.replaceAll('\n- [X]', '\n- [ ]').replaceAll('\n- [x]', '\n- [ ]');

		document.data = parse_document(document.data.raw);
		document = {
			...document,
			data: {
				...document.data,
				raw: remove_answers(document.data.raw),
				sections: document.data.sections.map((v) => {
					if (v.type === 'question') {
						const question_section = v as IQCMQuestionSection;
						return {
							...question_section,
							raw: remove_answers(v.raw),
							questions: question_section.questions.map((v) => {
								return {
									...v,
									answer: false,
									raw: v.raw.replaceAll('- [X]', '- [ ]').replaceAll('- [x]', '- [ ]')
								};
							})
						};
					}
					return v;
				})
			}
		};
	}
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

export function submitAnswer(access_id: string, doc: IDocument) {
	const access = loadAccess(access_id);

	if (!access) throw new Error('Could not recognize access');
	if (access.permission != 'read') throw new Error('Does not have permission to send submition');

	saveAnswer(doc);
}

export function retrieveAnswer(access_write: string, access_id: string) {
	const w_access = loadAccess(access_write);

	if (!w_access) throw new Error('Could not recognize access');
	if (w_access.permission != 'write' || w_access.reads?.includes(access_id))
		throw new Error('Does not have permission to read submitions');
	const r_access = loadAccess(access_id);
	if (!r_access) return undefined;

	return loadAnswer(r_access.document_id);
}
