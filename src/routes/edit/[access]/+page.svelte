<script lang="ts">
	import type { PageProps } from './$types';
	import QcmEditor from '$lib/components/QCMEditor.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { writable } from 'svelte/store';
	import { browser } from '$app/environment';
	import { cached_documents } from '../../../store';

	const origin = page.url.origin;

	const { data }: PageProps = $props();
	let value = writable(data.document.data.raw);

	let last_updated = new Date().getTime();
	value.subscribe((newv) => {
		last_updated = new Date().getTime();
		data.document.data.raw = newv;

		cached_documents.update((v) => {
			let new_v = v || {};
			new_v[data.access] = data.document;
			console.log('HHHHh');
			return new_v;
		});
	});

	const saver = setInterval(async () => {
		if (!browser) return;
		if (last_updated === data.document.updated) return;
		data.document.updated = last_updated;

		await fetch(origin + '/access/' + data.access, {
			method: 'POST',
			body: JSON.stringify(data.document),
			headers: {
				'content-type': 'application/json'
			}
		});
	}, 5000);

	function onDismount() {
		clearTimeout(saver);
	}

	onMount(() => {
		return onDismount;
	});
</script>

<div class="relative flex flex-1 flex-col">
	<div class="overflow-hidden">
		<QcmEditor bind:value={$value} />
	</div>
</div>
