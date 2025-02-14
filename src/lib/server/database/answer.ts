import { existsSync, readFileSync, writeFileSync } from 'fs';
import type { IAnswerMetadata, IDocument } from '$lib/types';
import assert from 'assert';
import { randomUUID } from 'crypto';

const NAME = 'data/qcm_answers.json';

interface Data {
	[key: string]: IDocument & IAnswerMetadata;
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

export function save(doc: IDocument & IAnswerMetadata) {
	if (!data) loadFile();
	assert(data, 'Data should be loaded');
	doc.updated = new Date().getTime();
	data[doc.id] = data[doc.id] || doc;
	data[doc.id].updated = new Date().getTime();
	data[doc.id].data = doc.data;
	data[doc.id].title = doc.title;
	saveFile();
}

export function load(id: string): (IDocument & IAnswerMetadata) | undefined {
	if (!data) loadFile();
	assert(data, 'Data should be loaded');

	return data[id];
}
