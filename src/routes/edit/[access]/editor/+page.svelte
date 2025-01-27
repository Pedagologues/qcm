<script lang="ts">
	import type { PageProps } from './$types';
	import QcmEditor from '$lib/components/QCMEditor.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { writable, type Writable } from 'svelte/store';
	import { browser } from '$app/environment';
	import { cached_documents } from '../../../../store';
	import type { IDocumentMetadata } from '../../../../lib/types';
	import DateInput from '../../../../lib/components/DateInput.svelte';

	const origin = page.url.origin;

	const { data }: PageProps = $props();
	let value = writable(data.document.data.raw);
	let meta = writable({ ...data.document } as IDocumentMetadata);

	let meta_date: Writable<Date | undefined> = writable(
		($meta.due_date ? new Date($meta.due_date) : undefined) as Date | undefined
	);

	meta_date.subscribe((v) => ($meta.due_date = v?.getTime()));

	let last_updated = new Date().getTime();

	meta.subscribe((newmeta) => {
		last_updated = new Date().getTime();
		data.document.due_date = newmeta.due_date;
		data.document.due_limit = newmeta.due_limit;
		data.document.instant_correction = newmeta.instant_correction;

		cached_documents.update((v) => {
			let new_v = v || {};
			new_v[data.access] = data.document;
			return new_v;
		});
	});

	value.subscribe((newv) => {
		last_updated = new Date().getTime();
		data.document.data.raw = newv;

		cached_documents.update((v) => {
			let new_v = v || {};
			new_v[data.access] = data.document;
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

	<div class="flex flex-1 flex-row justify-between bg-surface-700 p-5">
		<div class="flex w-1/5 flex-col">
			<div class="flex flex-row gap-5">
				Due Date
				<input
					class="checkbox"
					type="checkbox"
					checked={$meta_date != null}
					onchange={(e: any) => {
						const checked = e.target.checked;
						if (checked) $meta_date = new Date();
						else $meta_date = undefined;
					}}
				/>
			</div>

			<DateInput class_="input" bind:date={$meta_date} disabled={$meta_date == null} />
		</div>

		<div class="flex w-1/5 flex-col">
			<div class="flex flex-row gap-5">
				Instant Correction
				<input class="checkbox" type="checkbox" bind:checked={$meta.instant_correction} />
			</div>
		</div>

		<div class="flex w-1/5 flex-col">
			<div class="flex flex-row gap-5">
				Submission limit
				<input
					class="checkbox"
					type="checkbox"
					checked={data.document.due_limit != null}
					onchange={(e: any) => {
						const checked = e.target.checked;
						if (checked) $meta.due_limit = 1;
						else $meta.due_limit = undefined;
					}}
				/>
			</div>

			<input
				class="input"
				type="number"
				min="1"
				bind:value={$meta.due_limit}
				disabled={$meta.due_limit == null}
			/>
		</div>
	</div>
</div>
