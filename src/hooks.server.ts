import type { Handle } from '@sveltejs/kit';
import sqlite from 'sqlite3';

const { Database } = sqlite;

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.locals.db) {
		const db = new Database('db.sqlite', (err: unknown) => {
			if (err) {
				throw err;
			}
		});

		// Set the db as our events.db variable.
		event.locals.db = db;

		// We can create a basic table in the db
		db.run(
			`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER NOT NULL PRIMARY KEY,
				view_key TEXT,
				edit_key TEXT
            );`,
			(err) => {
				if (err) {
					throw err;
				}
			}
		);
	}
	const resp = await resolve(event);
	return resp;
};
