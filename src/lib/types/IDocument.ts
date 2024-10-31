export default interface IDocument {
	id: number;
	name: string;
	data: string;
	created: Date;
	updated: Date;
	view?: string;
	edit?: string;
}
