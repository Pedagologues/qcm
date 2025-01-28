import assert from 'assert';
import type {
	IDocumentAccess,
	IQCMCorrection,
	IQCMQuestionSection,
	IQuestionCorrection
} from '../types';
import '.';
import { loadAccess, loadAnswer, loadDocument } from '.';
import { parse_document } from '../parser';

export function correction(access_id: string): IQCMCorrection {
	const access = loadAccess(access_id);

	assert(access);
	assert(access.permission === 'read');
	assert(access.answer);

	const orig_doc = loadDocument(access.document_id);

	if (
		!orig_doc?.instant_correction &&
		orig_doc?.due_date &&
		orig_doc.due_date > new Date().getTime()
	)
		throw new Error("Can't show correction");

	const answer = loadAnswer(access.answer);
	assert(orig_doc && answer);
	orig_doc.data = parse_document(orig_doc.data.raw);
	assert(orig_doc?.data.sections.length == answer?.data.sections.length);

	let question_corrections: IQCMCorrection = {};

	for (let i = 0; i < orig_doc?.data.sections.length; i++) {
		let [orig_section, ans_section] = [orig_doc.data.sections[i], answer.data.sections[i]];
		assert(orig_section.type == ans_section.type);

		if (orig_section.type != 'question') continue;

		let [orig_q, ans_q] = [orig_section as IQCMQuestionSection, ans_section as IQCMQuestionSection];

		let q_correction: IQuestionCorrection = {};

		assert(orig_q.questions.length == ans_q.questions.length);

		for (let j = 0; j < orig_q.questions.length; j++) {
			const o_a = orig_q.questions[j].answer;
			const a_a = ans_q.questions[j].answer;

			if (o_a && a_a) q_correction[j] = 'valid';
			else if (o_a && !a_a) q_correction[j] = 'missing';
			else if (!o_a && a_a) q_correction[j] = 'wrong';
		}

		question_corrections[i] = q_correction;
	}

	return question_corrections;
}
