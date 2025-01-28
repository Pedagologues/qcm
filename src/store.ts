import { writable, type Writable } from 'svelte/store';
import type { IAnswerMetadata, IDocument, IDocumentMetadata, IQCMCorrection } from './lib/types';
import { stored_writable } from './lib/store';

export const cached_documents: Writable<{ [key: string]: IDocument & IDocumentMetadata }> =
	stored_writable('documents', writable({}));

export const cached_documents_reads: Writable<{
	[key: string]: { access: string; alias: string }[];
}> = stored_writable('document_reads', writable({}));

export const cached_answers: Writable<{
	[key: string]: IDocument & IDocumentMetadata & IAnswerMetadata;
}> = stored_writable('answers', writable({}));

export const cached_corrections: Writable<{
	[key: string]: IQCMCorrection | undefined;
}> = stored_writable('corrections', writable({}));
