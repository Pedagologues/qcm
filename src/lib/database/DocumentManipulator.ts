import type IDocument from '$lib/types/IDocument';
import type ILocalDocument from '$lib/types/ILocalDocument';
import type { Database } from 'sqlite3';

export async function toDatabase(db: Database, document: ILocalDocument): Promise<void> {
	if (!document.id || document.id === -1) {
		const query = `
		INSERT INTO documents (name, data, created, updated, view, edit)
		VALUES (?, ?, ?, ?, ?, ?) RETURNING documents.id
		`;

		return new Promise((resolve, reject) => {
			db.run(
				query,
				[
					document.name,
					document.data,
					document.created.getTime(),
					document.created.getTime(),
					document.view || null,
					document.edit || null
				],
				function (error) {
					if (error) reject(error);
					document.id = this.lastID;
					resolve();
				}
			);
		});
	} else {
		const query = `
		UPDATE documents
            SET name = ?, data = ?, created = ?, updated = ?, view = ?, edit = ?
            WHERE id = ?
		`;

		db.run(query, [
			document.name,
			document.data,
			document.created.getTime(),
			document.updated.getTime(),
			document.view || null,
			document.edit || null,
			document.id
		]);
	}
}

export async function fromDatabase(db: Database, id: number): Promise<IDocument | null> {
	const query = `SELECT * FROM documents WHERE id = ?`;

	return new Promise((resolve, reject) => {
		db.get(query, [id], (err, rows) => {
			if (err) reject(err);
			resolve(ensureDocumentType(rows));
		});
	});
}

export function ensureDocumentType(v: any): ILocalDocument {
	return {
		...v,
		updated: v.updated ? new Date(v.updated) : undefined,
		created: v.created ? new Date(v.created) : undefined,
		sent: v.sent ? new Date(v.sent) : undefined
	};
}
