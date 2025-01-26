import { existsSync, readFileSync, writeFileSync } from 'fs';
import type { IDocument } from '$lib/types';
import assert from 'assert';
import { randomUUID } from 'crypto';

const NAME = 'data/qcm_answers.json';

interface Data {
	[key: string]: IDocument;
}

function emptyDocument(): IDocument {
	return {
		id: '-1',
		updated: new Date().getTime(),
		created: new Date().getTime(),
		data: {
			raw: '',
			sections: []
		}
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

function generateNewId(): string {
	return randomUUID().toString();
}

export function save(doc: IDocument) {
	if (!data) loadFile();
	assert(data, 'Data should be loaded');
	doc.updated = new Date().getTime();
	data[doc.id] = data[doc.id] || emptyDocument();
	data[doc.id].updated = new Date().getTime();
	data[doc.id].data = doc.data;
	saveFile();
}

export function load(id: string): IDocument | undefined {
	if (!data) loadFile();
	assert(data, 'Data should be loaded');

	return data[id];
}
