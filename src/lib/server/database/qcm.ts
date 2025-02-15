import { existsSync, readFileSync, writeFileSync } from 'fs';
import type { IDocument, IDocumentMetadata } from '$lib/types';
import assert from 'assert';
import { randomUUID } from 'crypto';
import { parse_document } from '$lib/parser';

const NAME = 'data/qcm_data.json';

interface Data {
	[key: string]: IDocument & IDocumentMetadata;
}

function emptyDocument(): IDocument & IDocumentMetadata {
	const default_raw = `#?#\n\nWhat's the answer to the big question about life, the universe and everything else ?\n- [X] 42\n- [ ] 13\n- [ ] 7\n\n#?#\n\nWhere does the reference for the previous question come from ?\n- [X] H2G2\n- [X] The Hitchhiker's Guide to the Galaxy\n- [ ] Romeo and Juliet`
	return {
		id: '-1',
		updated: new Date().getTime(),
		created: new Date().getTime(),
		data: parse_document(default_raw),
		instant_correction: true,
		title: ""
	};
}

let data: Data | undefined;

function loadFile() {
	if (existsSync(NAME)) data = JSON.parse(readFileSync(NAME).toString());
	else data = {};
}

function saveFile() {
	writeFileSync(NAME, JSON.stringify(data));
}

export function generateNewId(): string {
	return randomUUID().toString();
}

export function save(doc: IDocument & IDocumentMetadata) {
	if (!data) loadFile();
	assert(data, 'Data should be loaded');
	doc.updated = new Date().getTime();
	data[doc.id].updated = new Date().getTime();
	data[doc.id].data = parse_document(doc.data.raw)
	data[doc.id].due_date = doc.due_date;
	data[doc.id].due_limit = doc.due_limit;
	data[doc.id].instant_correction = doc.instant_correction;
	data[doc.id].title = doc.title;
	saveFile();
}

export function load(id: string): (IDocument & IDocumentMetadata) | undefined {
	if (!data) loadFile();
	assert(data, 'Data should be loaded');

	return data[id];
}

export function newDocument(): IDocument & IDocumentMetadata {
	if (!data) loadFile();
	assert(data, 'Data should be loaded');

	let doc = emptyDocument();
	while ((doc.id = generateNewId()) && data[doc.id] != undefined);
	data[doc.id] = doc;
	saveFile();

	return doc;
}
