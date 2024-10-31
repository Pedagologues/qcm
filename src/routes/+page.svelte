<script lang="ts">
	// Component default theme
	import 'carta-md/default.css';
	// Extentsions themes
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-emoji/default.css';
	import '@cartamd/plugin-slash/default.css';
	import 'katex/dist/katex.css';

	import { Tab, TabGroup } from '@skeletonlabs/skeleton';

	import { getModalStore, Modal, type ModalSettings } from '@skeletonlabs/skeleton';

	import QcmEditor from '$lib/components/QCMEditor.svelte';
	import { derived_writable } from '$lib/store';
	import { onMount } from 'svelte';
	import { type Writable } from 'svelte/store';
	import { local_documents, type IDocument } from '../store';

	let selected: number = 0;

	onMount(() => {
		if ($local_documents.length == 0) {
			$local_documents = $local_documents.concat({
				name: 'New 0',
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

	const modalStore = getModalStore();

	const modal_gen = (): ModalSettings => {
		return {
			type: 'prompt',
			title: 'Enter Title',
			body: 'Provide the file title in the prompt below.',
			value: $current_document?.name,
			valueAttr: { type: 'text', minlength: 3, maxlength: 16, required: true },
			// Returns the updated response value
			response: (r: any) => {
				console.log(r);
				if (r === false) return;

				if (current_document) {
					const v = $current_document;
					$current_document = {
						...v,
						name: r,
						updated: new Date()
					} as IDocument;
				}
			}
		};
	};
</script>

<Modal />
<TabGroup>
	{#each $local_documents as doc}
		<Tab
			bind:group={selected}
			name={doc.name}
			value={doc.local_id}
			on:click={(e) => {
				if (doc.local_id === selected) modalStore.trigger(modal_gen());
			}}
			>{doc.name}
			{#if !doc.sent || doc.sent.getTime() < doc.updated.getTime()}
				<strong>*</strong>
			{/if}

			{#if doc.local_id === selected}
				<button
					type="button"
					class="mx-1 *:self-center"
					on:click={() => {
						$local_documents = $local_documents.filter((v) => v.local_id != selected);
						selected;
					}}
				>
					x
				</button>
			{/if}
		</Tab>
	{/each}

	<button
		type="button"
		class="variant-outline btn-icon mx-4 size-8 self-center"
		on:click={() => {
			const newId = $local_documents.map((v) => v.local_id).reduce((x, y) => (x > y ? x : y)) + 1;
			$local_documents = $local_documents.concat({
				name: 'New ' + newId,
				local_id: newId,
				data: '',
				updated: new Date(),
				created: new Date()
			});
			selected = newId;
		}}
	>
		+
	</button>
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
