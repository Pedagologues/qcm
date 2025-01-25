<script lang="ts">
	import type { PageProps } from './$types';
	import QcmEditor from '$lib/components/QCMEditor.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { writable } from 'svelte/store';
	import { browser } from '$app/environment';

	const origin = page.url.origin;

	const { data }: PageProps = $props();
	let value = writable(data.document.data.raw);

	let last_updated = new Date().getTime();
	value.subscribe(() => (last_updated = new Date().getTime()));

	const saver = setInterval(async () => {
		if (!browser) return;
		if (last_updated === data.document.updated) return;
		data.document.data.raw = $value;
		data.document.updated = last_updated;

		const o = await fetch(origin + '/access/' + data.access, {
			method: 'POST',
			body: JSON.stringify(data.document),
			headers: {
				'content-type': 'application/json'
			}
		}).then((v) => v.json());
	}, 5000);

	function onDismount() {
		clearTimeout(saver);
	}

	onMount(() => {
		return onDismount;
	});
</script>

<div class="relative">
	<QcmEditor bind:value={$value} />
</div>
