<script lang="ts">
	// Component default theme
	import 'carta-md/default.css';
	// Extentsions themes
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-emoji/default.css';
	import '@cartamd/plugin-slash/default.css';
	import 'katex/dist/katex.css';

	import { Tab, TabGroup } from '@skeletonlabs/skeleton';

	import QcmEditor from '$lib/components/QCMEditor.svelte';
	import { derived_writable } from '$lib/store';
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { local_documents, type IDocument } from '../store';

	let selected: number = 0;

	onMount(() => {
		if ($local_documents.length == 0) {
			$local_documents = $local_documents.concat({
				name: 'New',
				local_id: 0,
				data: '',
				updated: new Date(),
				created: new Date()
			});
		}

		selected =
			$local_documents
				.toSorted((v1, v2) => v1.updated.getTime() - v2.updated.getTime())
				.find(() => true)?.local_id || 0;
	});

	let current_document: Writable<IDocument> | undefined;
	$: current_document = $local_documents.find((v) => v.local_id == selected)
		? derived_writable(
				local_documents,
				() => $local_documents.find((v) => v.local_id == selected) as IDocument,
				(v) => {
					$local_documents = $local_documents.map((o) => (o.local_id == selected ? v : o));
				}
			)
		: undefined;
</script>

<TabGroup>
	{#each $local_documents as doc}
		<Tab bind:group={selected} name={doc.name} value={doc.local_id}
			>{doc.name}
			{#if !doc.sent || doc.sent.getTime() < doc.updated.getTime()}
				<strong>*</strong>
			{/if}</Tab
		>
	{/each}
	<!-- Tab Panels --->
	<svelte:fragment slot="panel">
		{#if $current_document}
			<QcmEditor bind:current_document={current_document as Writable<IDocument>} />
		{/if}
	</svelte:fragment>
</TabGroup>

<style>
	/* Or in global stylesheet */
	/* Set your monospace font (Required to have the editor working correctly!) */
	:global(.carta-font-code) {
		font-family: '...', monospace;
		font-size: 1.1rem;
	}
</style>
