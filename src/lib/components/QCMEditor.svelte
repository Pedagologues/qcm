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
	import type ILocalDocument from '$lib/types/ILocalDocument';
	import DOMPurify from 'dompurify';

	interface ICurrentDoc {
		value: ILocalDocument;
	}

	let { current_document }: { current_document: ICurrentDoc } = $props();
	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		extensions: [math(), code(), slash(), tikz(), qcm()]
	});

	let h_value = $state(current_document.value?.data);
	$effect(() => {
		if (current_document.value.data === h_value) return;
		current_document.value = {
			...current_document.value,
			data: h_value,
			updated: new Date()
		};
	});

	let editor_data = {
		get value() {
			return h_value;
		},
		set value(v) {
			h_value = v;
		}
	};
</script>

{#if current_document}
	<MarkdownEditor {carta} mode={'auto'} bind:value={editor_data.value} />
{/if}

<style>
	/* Or in global stylesheet */
	/* Set your monospace font (Required to have the editor working correctly!) */
	:global(.carta-font-code) {
		font-family: '...', monospace;
		font-size: 1.1rem;
	}
</style>
