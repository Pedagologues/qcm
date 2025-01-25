import type { IQCMDocument, IQCMQuestionSection, IQCMSection, IQCMTextSection } from './../types';

export function parse_document(md: string): IQCMDocument {
	const REGEX = /(^|\n)(#\?#)(\s*\((.*)\))?\s*/gm;

	let raw_sections: string[] = [];
	let match;
	let previous_index = 0;
	while ((match = REGEX.exec(md))) {
		if (md.charAt(match.index as number) == '\n') match.index = match.index + 1;
		raw_sections.push(md.substring(previous_index, match.index));
		previous_index = match.index;
	}
	raw_sections.push(md.substring(previous_index));
	raw_sections.shift();

	let sections = raw_sections.map(parseSection).filter((v) => v.raw.trim().includes('\n'));

	let indexer: Map<string, number> = new Map();

	let sanitizer = (v: string): string => v.toLocaleLowerCase().replace(RegExp('\s+'), '-');

	sections.forEach((v) => {
		v.numbering = indexer.get(sanitizer(v.title)) || 0;
		indexer.set(sanitizer(v.type), (indexer.get(sanitizer(v.type)) || 0) + 1);
		indexer.set(sanitizer(v.title), v.numbering + 1);
	});

	return {
		raw: md,
		sections
	};
}

function parseSection(raw_section: string): IQCMSection {
	const REGEX = /^(#\?#)(\s*\((.*)\))?\s*$/;
	const first_line = raw_section.substring(0, raw_section.indexOf('\n'));

	if (!REGEX.test(first_line)) throw new Error('Header Parsing failed for ' + first_line);

	let title = (REGEX.exec(first_line) || [])[3];
	let numbering = 0;

	let type: 'question' | 'text' | undefined = undefined;

	if (
		raw_section.includes('\n- [ ]') &&
		(raw_section.includes('\n- [x]') || raw_section.includes('\n- [X]'))
	)
		type = 'question';
	else type = 'text';

	let section: IQCMSection = {
		title: title || type.toLocaleUpperCase(),
		numbering,
		type,
		raw: raw_section.trim()
	};

	if (type == 'question') return parseQuestion(section);
	else if (type == 'text') return parseText(section);

	throw new Error('Wrong type');
}

function parseQuestion(section: IQCMSection): IQCMQuestionSection {
	let sub_sections = section.raw
		.split('\n- [ ]')
		.map((v, i) => (i != 0 ? '- [ ] ' + v : v))
		.map((v) => v.split('\n- [X]').map((v, i) => (i != 0 ? '- [X] ' + v : v)))
		.flat()
		.map((v) => v.split('\n- [x]').map((v, i) => (i != 0 ? '- [X] ' + v : v)))
		.flat();

	let header = sub_sections[0];
	let questions = sub_sections
		.filter((v, i) => i != 0)
		.map((v) => {
			return {
				answer: v.startsWith('- [X]'),
				raw: v
			};
		});

	return { ...section, type: 'question', header, questions };
}

function parseText(section: IQCMSection): IQCMTextSection {
	return { ...section, type: 'text' };
}
