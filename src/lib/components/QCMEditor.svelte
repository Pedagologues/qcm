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
	import { derived_writable } from '$lib/store';
	import DOMPurify from 'isomorphic-dompurify';
	import { type Writable } from 'svelte/store';
	import { type IDocument } from '../../store';

	export let current_document: Writable<IDocument>;

	let data = derived_writable(
		current_document,
		() => $current_document.data,
		(v) => ($current_document.data = v)
	);

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		extensions: [math(), code(), slash(), tikz(), qcm()]
	});
</script>

{#if current_document != null && $current_document != null}
	<MarkdownEditor {carta} mode={'auto'} bind:value={$data} />
{/if}

<style>
	/* Or in global stylesheet */
	/* Set your monospace font (Required to have the editor working correctly!) */
	:global(.carta-font-code) {
		font-family: '...', monospace;
		font-size: 1.1rem;
	}
</style>
