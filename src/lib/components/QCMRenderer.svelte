<script lang="ts">
	import { code } from '@cartamd/plugin-code';
	import { math } from '@cartamd/plugin-math';
	import { slash } from '@cartamd/plugin-slash';
	import { tikz } from '@cartamd/plugin-tikz';
	import { Carta, CartaViewer, MarkdownEditor } from 'carta-md';
	// Component default theme
	import './cartamd.css';
	// Extentsions themes
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-emoji/default.css';
	import '@cartamd/plugin-slash/default.css';
	import 'katex/dist/katex.css';

	import { qcm } from '$lib/plugin-qcm';
	import { tailwind } from '$lib/plugin-tailwind';
	import { browser } from '$app/environment';

	export let value: string;

	const carta = new Carta({
		theme: 'github-dark',
		sanitizer: false,
		extensions: [math(), code(), slash(), tikz(), qcm({ view: true }), tailwind()]
	});
</script>

<CartaViewer {carta} bind:value />

<style>
	/* Or in global stylesheet */
	/* Set your monospace font (Required to have the editor working correctly!) */
	:global(.carta-font-code) {
		font-family: '...', monospace;
		font-size: 1.1rem;
	}
</style>
