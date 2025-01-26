<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { derived, writable } from 'svelte/store';
	import { cached_documents_reads } from '../../../../store';
	import type { ChangeEventHandler, FormEventHandler } from 'svelte/elements';

	const origin = page.url.origin;

	const { data }: PageProps = $props();
	let reads = writable($cached_documents_reads[data.access] || []);

	reads.subscribe((new_reads) => {
		cached_documents_reads.update((v) => {
			v[data.access] = new_reads;
			return v;
		});
	});

	const onNewValue: FormEventHandler<any> = function (event: any) {
		const value = (event.target as any)?.value || '';
		const i = $reads.length;
		reads.update((v) => {
			const newV = v || [];
			newV.push({ alias: value, access: '' });
			return newV;
		});
		event.target.value = '';
		setTimeout(() => {
			document.getElementById('input-' + i)?.focus();
		});
	};

	const onGenerate = async function () {
		const qt = $reads.filter((v) => v.access.length < 36).length;

		if (qt === 0) return;

		const obj = await fetch(origin + '/access/new/' + data.access + '/' + qt, {
			method: 'POST',
			body: JSON.stringify(data.document),
			headers: {
				'content-type': 'application/json'
			}
		}).then((v) => v.json());

		if (!obj.data) return;

		const accesses = obj.data as string[];

		reads.update((old_r) => {
			let i = 0;

			let newR = old_r.map((v) => {
				if (v.access.length >= 36) return v;
				else {
					let newV = {
						...v,
						access: accesses[i]
					};
					i += 1;

					return newV;
				}
			});

			return newR;
		});
	};
</script>

<div>
	<table class="table border-separate border-spacing-2">
		<thead>
			<tr>
				<th scope="col">Alias</th>
				<th scope="col">Id</th>
				<th scope="col">Url</th>
			</tr>
		</thead>
		<tbody>
			{#each $reads.map((v, i) => {
				return { ...v, index: i };
			}) as read}
				<tr>
					<th scope="col" class="whitespace-nowrap text-left shadow-lg">
						<input
							id={'input-' + read.index}
							class="input w-full p-2 px-5"
							value={read.alias}
							oninput={(e: any) => {
								reads.update((v) => {
									v[read.index].alias = e.target.value;

									return v;
								});
							}}
						/>
					</th>
					<td class="w-0 shadow-lg">{read.access}</td>
					<td class="w-20 shadow-lg hover:text-blue-400"
						><a href={origin + '/view/' + read.access} target="_blank">Go to url</a></td
					>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<th scope="col" class="text-left shadow-lg">
					<input class="input m-1 w-full p-2 px-5" oninput={onNewValue} />
				</th>
				<td class="m-0 select-none border p-0 text-center text-lg shadow-lg hover:bg-surface-900">
					<button class="h-full w-full" onclick={onGenerate}> Generate </button>
				</td>
			</tr>
		</tfoot>
	</table>
</div>
