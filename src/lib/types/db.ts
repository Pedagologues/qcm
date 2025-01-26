import type { IQCMDocument } from './parser';

export interface IDocument {
	id: string;
	created: number;
	updated: number;
	data: IQCMDocument;
}

export type DocumentPermission = 'read' | 'write';

export interface IDocumentAccess {
	id: string;
	document_id: string;
	permission: DocumentPermission;
	reads?: string[];
}
