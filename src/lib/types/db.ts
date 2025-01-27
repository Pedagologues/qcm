import type { IQCMDocument } from './parser';

export interface IDocument {
	id: string;
	created: number;
	updated: number;
	data: IQCMDocument;
}

export interface IDocumentMetadata {
	due_date?: number;
	due_limit?: number;
	instant_correction: boolean;
}

export interface IAnswerMetadata {
	submition_count: number;
}

export type DocumentPermission = 'read' | 'write';

export interface IDocumentAccess {
	id: string;
	document_id: string;
	permission: DocumentPermission;
	reads?: string[];
	answer?: string;
}
