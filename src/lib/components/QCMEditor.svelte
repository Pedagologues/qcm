<script lang="ts">
	import { code } from '@cartamd/plugin-code';
	import { math } from '@cartamd/plugin-math';
	import { slash } from '@cartamd/plugin-slash';
	import { tikz } from '@cartamd/plugin-tikz';
	import { Carta, MarkdownEditor } from 'carta-md';
	// Component default theme
	import 'carta-md/default.css';
	// Extentsions themes
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-emoji/default.css';
	import '@cartamd/plugin-slash/default.css';
	import 'katex/dist/katex.css';

	import { qcm } from '$lib/plugin-qcm';
	import { tailwind } from '$lib/plugin-tailwind';
	import type ILocalDocument from '$lib/types/ILocalDocument';

	interface ICurrentDoc {
		get_value(): ILocalDocument;
		set_value(v: ILocalDocument): void;
	}

	let { current_document }: { current_document: ICurrentDoc } = $props();

	let start_id = current_document.get_value().local_id;

	const carta = new Carta({
		sanitizer: false,
		extensions: [math(), code(), slash(), tikz(), qcm(), tailwind()]
	});

	let h_value = $state(current_document.get_value().data);
	$effect(() => {
		if (current_document.get_value().local_id !== start_id) {
			h_value = current_document.get_value().data;
			start_id = current_document.get_value().local_id;
		}
		if (
			current_document.get_value().data === h_value ||
			current_document.get_value().local_id !== start_id
		)
			return;
		current_document.set_value({
			...current_document.get_value(),
			data: h_value,
			updated: new Date()
		});
	});

	let editor_data = {
		get value() {
			return h_value;
		},
		set value(v) {
			h_value = v;
		}
	};

	const current_id = $derived(current_document.get_value().local_id);
</script>

{#if current_document.get_value()}
	{#key current_id}
		<MarkdownEditor disableToolbar {carta} mode={'auto'} bind:value={editor_data.value} />
	{/key}
{/if}

<style>
	/* Or in global stylesheet */
	/* Set your monospace font (Required to have the editor working correctly!) */
	:global(.carta-font-code) {
		font-family: '...', monospace;
		font-size: 1.1rem;
	}
</style>
