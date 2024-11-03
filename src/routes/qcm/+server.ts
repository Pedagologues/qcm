import { fromDatabaseWithPublicToken } from '$lib/database/DocumentManipulator.js';
import type IAnswer from '$lib/types/IAnswer.js';
import type { IAnswerValidation } from '$lib/types/IAnswerValidation.js';
import type IDocument from '$lib/types/IDocument.js';
import { error, json } from '@sveltejs/kit';
import { getConnection } from '../../hooks.server.js';

/** @type {import('./$types').RequestHandler} */

export async function POST({ request }) {
	const answers: IAnswer = await request.json();
	const doc: IDocument | null = await fromDatabaseWithPublicToken(getConnection(), answers.view);

	if (!doc) return error(400);

	if (answers.answers.length !== doc.data.split('#?#').length - 1) return error(400);

	const processed: IAnswerValidation[] = doc.data
		.replaceAll('[x]', '[X]')
		.split('#?#')
		.filter((v, i) => i != 0)
		.map((v, i) => {
			const x = v
				.split('- [ ]')
				.map((v, i) =>
					(i > 0 ? '- [ ]' + v : v).split('- [X]').map((v, i) => (i > 0 ? '- [X]' + v : v))
				)
				.reduce((a, b) => a.concat(b), [])
				.filter((v, i) => i > 0);

			const valid = x
				.map((o, i) => (o.startsWith('- [X]') ? i : undefined))
				.filter((v) => v !== undefined)
				.map((v) => String(v));

			const answer = answers.answers.find((q) => q.question === String(i))?.element || [];

			return {
				question: String(i),
				valid: x.filter((v, i) => valid.includes(String(i))),
				answer: x
					.filter((v, i) => answer.includes(String(i)))
					.map((v) => v.replaceAll('- [x]', '- [X]').replaceAll('- [ ]', '- [X]')),
				correct: JSON.stringify(answer) === JSON.stringify(valid)
			};
		});

	return json(processed);
}
