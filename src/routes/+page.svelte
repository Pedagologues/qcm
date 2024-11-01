<script lang="ts">
	import { getModalStore, Modal, Tab, TabGroup, type ModalSettings } from '@skeletonlabs/skeleton';

	import QcmEditor from '$lib/components/QCMEditor.svelte';
	import type ILocalDocument from '$lib/types/ILocalDocument';
	import { writable, type Writable } from 'svelte/store';
	import { local_documents } from '../store';

	let selected: Writable<number | undefined> = writable(0);

	$effect(() => {
		if (!$local_documents.find((v) => v.local_id === $selected)) $selected = undefined;
	});

	let current_document = $state({
		get value() {
			return $local_documents.find((v) => v.local_id === $selected);
		},

		set value(v) {
			$local_documents = $local_documents.map((o) => (o.local_id === $selected && v ? v : o));
		}
	});

	const modalStore = getModalStore();

	const modal_gen = (): ModalSettings => {
		return {
			type: 'prompt',
			title: 'Enter Title',
			body: 'Provide the file title in the prompt below.',
			value: current_document.value?.name,
			valueAttr: { type: 'text', minlength: 3, maxlength: 16, required: true, autocomplete: 'off' },
			response: (r: any) => {
				if (!r || r === false) return;

				if (current_document.value) {
					current_document.value = {
						...current_document.value,
						name: r,
						updated: new Date()
					} as ILocalDocument;
				}
			}
		};
	};

	async function save_current() {
		if (!current_document.value) return;
		current_document.value = {
			...current_document.value,
			updated: new Date(),
			sent: new Date()
		};

		const response = await fetch('/document', {
			method: 'POST',
			body: JSON.stringify(current_document.value),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const object = await response.json();

		current_document.value = {
			...current_document.value,
			id: object.id,
			view: object.view,
			edit: object.edit
		} as ILocalDocument;
	}

	local_documents.subscribe((v) => {
		if (!v.find((object) => object.local_id === $selected))
			$selected = v.find((v) => v.local_id)?.local_id || 0;
	});
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.ctrlKey && e.key === 's') {
			e.preventDefault();
			save_current();
		}
	}}
/>

<Modal />
<TabGroup regionList="self-center" regionPanel="self-center">
	{#each $local_documents as doc}
		<Tab
			regionTab="self-center"
			bind:group={$selected}
			name={doc.name}
			value={doc.local_id}
			on:click={(e) => {
				if (doc.local_id === $selected) modalStore.trigger(modal_gen());
			}}
			>{doc.name}
			{#if !doc.sent || doc.sent.getTime() < doc.updated.getTime()}
				<strong>*</strong>
			{/if}

			{#if doc.local_id === $selected}
				<button
					type="button"
					class="mx-1 *:self-center"
					onclick={() => {
						$local_documents = $local_documents.filter((v) => v.local_id != $selected);
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
		onclick={() => {
			const newId =
				$local_documents.map((v) => v.local_id).reduce((x, y) => (x > y ? x : y), 0) + 1;
			$local_documents = $local_documents.concat({
				id: -1,
				name: 'New ' + newId,
				local_id: newId,
				data: '',
				updated: new Date(),
				created: new Date()
			});
			$selected = newId;
		}}
	>
		+
	</button>
	<!-- Tab Panels --->
	<svelte:fragment slot="panel">
		{#if current_document.value}
			<QcmEditor current_document={current_document as any} />
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

	:global(.tab-list > label) {
		display: flex;
	}
</style>
