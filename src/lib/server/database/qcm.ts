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
	return {
		id: '-1',
		updated: new Date().getTime(),
		created: new Date().getTime(),
		data: {
			raw: '',
			sections: []
		},
		instant_correction: false
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
