import { loadAccess, loadAnswer, loadDocument, newAccess, saveAnswer, saveDocument } from '.';
import type { IAnswerMetadata, IDocumentMetadata, IQCMQuestionSection } from '../types';
import type { IDocument, IDocumentAccess } from '$lib/types';
import { appendReadToWrite } from './database/access';
import { parse_document } from '../parser';
import { generateNewId } from './database/qcm';
import { assert } from 'console';

export function saveWithAccess(access_id: string, doc: IDocument & IDocumentMetadata) {
	const access = loadAccess(access_id);

	if (!access) throw new Error('Could not recognize access');
	if (access.permission != 'write') throw new Error('Does not have permission to write');

	saveDocument(doc);
}

export function loadWithAccess(access_id: string): { document: IDocument; read: string[] } {
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
		return { document, read: [] };
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

export function submitAnswer(
	access_id: string,
	doc: IDocument & IAnswerMetadata
): IDocument & IAnswerMetadata & IDocumentMetadata {
	const access = loadAccess(access_id);

	if (!access) throw new Error('Could not recognize access');
	if (access.permission != 'read') throw new Error('Does not have permission to send submition');

	if (!access.answer) {
		access.answer = generateNewId();
		doc.created = new Date().getTime();
		doc.updated = new Date().getTime();
		doc.submition_count = 0;
	}

	const prev_answer = loadAnswer(access.answer);

	doc.id = access.answer;
	doc.submition_count = (prev_answer?.submition_count || 0) + 1;

	const opt_orig_doc = loadDocument(access.document_id);
	assert(opt_orig_doc != null);

	const orig_doc = opt_orig_doc as IDocument & IDocumentMetadata;

	if (orig_doc?.due_date && new Date().getTime() > orig_doc.due_date)
		throw new Error('Submition is done after due date');

	if (orig_doc?.due_limit && orig_doc.due_limit < doc.submition_count)
		throw new Error('Too many submitions');

	saveAnswer(doc);
	return {
		...doc,
		instant_correction: orig_doc.instant_correction,
		due_date: orig_doc.due_date,
		due_limit: orig_doc.due_limit
	};
}

export function retrieveAnswer(access_write: string, access_id: string) {
	const w_access = loadAccess(access_write);

	if (!w_access) throw new Error('Could not recognize access');
	if (w_access.permission != 'write' || w_access.reads?.includes(access_id))
		throw new Error('Does not have permission to read submitions');
	const r_access = loadAccess(access_id);
	if (!r_access || !r_access.answer) return undefined;

	const doc = loadAnswer(r_access.answer);
	const opt_orig_doc = loadDocument(r_access.document_id);

	assert(opt_orig_doc);

	const orig_doc = opt_orig_doc as IDocument & IDocumentMetadata;

	return {
		...doc,
		instant_correction: orig_doc.instant_correction,
		due_date: orig_doc.due_date,
		due_limit: orig_doc.due_limit
	};

	return;
}
