<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { ensureDocumentType } from '$lib/database/DocumentManipulator.js';
	import type ILocalDocument from '$lib/types/ILocalDocument.js';
	import { local_documents } from '../../store.js';

	let { data } = $props();

	let db_doc = data.doc;

	if (browser) {
		const newId = $local_documents.map((v) => v.local_id).reduce((x, y) => (x > y ? x : y), 0) + 1;

		const doc: ILocalDocument = {
			...ensureDocumentType(db_doc),
			sent: new Date(),
			local_id: newId
		};

		$local_documents = $local_documents.concat(doc);

		goto('/');
	}
</script>
