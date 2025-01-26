import { existsSync, readFileSync, writeFileSync } from 'fs';
import type {
	DocumentPermission as IDocumentPermission,
	IDocument,
	IDocumentAccess
} from '$lib/types';
import assert from 'assert';
import { randomUUID } from 'crypto';

const NAME = 'data/access.json';

interface Data {
	[key: string]: IDocumentAccess;
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

export function load(id: string): IDocumentAccess | undefined {
	if (!data) loadFile();
	assert(data, 'Data should be loaded');

	return data[id];
}

export function newAccess(id: string, permission: 'read' | 'write'): IDocumentAccess {
	if (!data) loadFile();
	assert(data, 'Data should be loaded');

	let doc = {
		id: '-1',
		document_id: id,
		permission: permission
	};
	while ((doc.id = generateNewId()) && data[doc.id] != undefined);
	data[doc.id] = doc;
	saveFile();

	return doc;
}

export function appendReadToWrite(write_access_id: string, id: string) {
	if (!data) loadFile();
	assert(data, 'Data should be loaded');

	const write_access = data[write_access_id];
	assert(write_access, 'Write access is invalid');

	write_access.reads = (write_access.reads || []).concat([id]);
	saveFile();
	data[write_access_id] = write_access;

	return write_access;
}
