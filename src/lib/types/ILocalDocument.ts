import type IDocument from './IDocument';

export default interface ILocalDocument extends IDocument {
	local_id: number;
	sent?: Date;
}
