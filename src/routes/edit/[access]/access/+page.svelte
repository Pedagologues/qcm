<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { derived, writable, type Writable } from 'svelte/store';
	import { cached_corrections, cached_documents_reads } from '../../../../store';
	import type { ChangeEventHandler, FormEventHandler } from 'svelte/elements';
	import { onMount } from 'svelte';
	import { FileButton } from '@skeletonlabs/skeleton';
	import Papa from 'papaparse';
	import CsvCellSelection from '../../../../lib/components/CsvCellSelection.svelte';
	import type { IQCMQuestionSection } from '../../../../lib/types';
	import { parse_document } from '../../../../lib/parser';

	const origin = page.url.origin;

	const { data }: PageProps = $props();
	let files: Writable<FileList | undefined> = writable();

	let tobeparsed_data: Writable<string[][] | undefined> = writable(undefined);

	files.subscribe(async (v) => {
		if (!v) return;
		if (!v.item(0)) return;

		const file = v.item(0);
		const raw = await file?.text();
		if (!raw) return;
		const parsed = Papa.parse(raw, {});
		const max_el = Math.max(...parsed.data.map((v) => (v as string[]).length));
		$tobeparsed_data = parsed.data.map((v) => v as string[]).filter((v) => v.length >= max_el);
	});

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

	let refresher_i = writable(0);
	let last_start = -1;
	const getter = setInterval(async () => {
		if ($refresher_i == -1 && new Date().getTime() - last_start < 10000) {
			return;
		} else if ($refresher_i == -1) {
			$refresher_i = 0;
			last_start = new Date().getTime();
		}

		if ($refresher_i >= $reads.length) {
			$refresher_i = -1;
			return;
		}
		if ($reads.length == 0) return;

		const read_access = $reads[$refresher_i].access;

		const answer = await fetch(origin + '/access/' + read_access + '/correction', {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		}).then((v) => v.json());

		if (!answer.error) {
			cached_corrections.update((corrections) => {
				let new_c = corrections || {};
				new_c[read_access] = answer.data;

				return new_c;
			});
		}

		$refresher_i = $refresher_i + 1;
	}, 1000);

	const getCsvExport = () => {
		const header: string[] = [];
		header.push('Alias');
		header.push('Submitted');
		data.document.data = parse_document(data.document.data.raw);

		const sections = data.document.data.sections
			.map((v, i) => {
				return { data: v, index: i };
			})
			.filter((v) => v.data.type == 'question')
			.map((v) => {
				return { data: v.data as IQCMQuestionSection, index: v.index };
			});

		sections.forEach((v) => {
			v.data.questions.forEach((_v, j) => {
				header.push(v.index + '.' + j);
			});
		});
		const correction_data: string[][] = [header];

		$reads.forEach((read) => {
			const correction_read_data = $cached_corrections[read.access];
			let row: string[] = [read.alias, correction_read_data != null ? 'X' : ''];
			sections.forEach((section) => {
				section.data.questions.forEach((v, j) => {
					const question_data = correction_read_data
						? correction_read_data[section.index]
						: undefined;
					const asnwer_data = question_data ? question_data[j] : v.answer ? 'missing' : undefined;

					const map =
						asnwer_data === 'missing'
							? 'M'
							: asnwer_data === 'wrong'
								? 'W'
								: asnwer_data === 'valid'
									? 'V'
									: undefined;

					row.push(map || '');
				});
			});
			correction_data.push(row);
		});

		return Papa.unparse(correction_data);
	};

	onMount(() => {
		return () => clearInterval(getter);
	});
</script>

{#if $tobeparsed_data != undefined}
	<CsvCellSelection
		raw_csv={$tobeparsed_data}
		onSubmit={(values) => {
			$tobeparsed_data = undefined;
			reads.update((v) => {
				const newV = v || [];
				newV.push(
					...values.map((value) => {
						return { alias: value, access: '' };
					})
				);
				return newV;
			});
		}}
	/>
{:else}
	<div class="flex flex-row justify-around">
		<div class="flex-1"></div>
		<label
			class="btn m-0 cursor-pointer border text-center text-lg shadow-lg hover:bg-surface-900"
			for="csv-import">Import from CSV</label
		>
		<input class="hidden" id="csv-import" type="file" accept=".csv" bind:files={$files} />
		<div class="flex-1"></div>
		<button
			class="btn m-0 select-none border text-center text-lg shadow-lg hover:bg-surface-900"
			onclick={() => {
				let mime_type = 'text/plain';

				var blob = new Blob([getCsvExport()], { type: mime_type });

				let dlink = document.createElement('a');
				document.body.appendChild(dlink);
				dlink.download = 'results.csv';
				dlink.href = window.URL.createObjectURL(blob);
				dlink.onclick = function (e) {
					// revokeObjectURL needs a delay to work properly
					var that: any = this;
					setTimeout(function () {
						window.URL.revokeObjectURL(that.href);
					}, 1500);
				};

				dlink.click();
				dlink.remove();
			}}>Export to CSV</button
		>
		<div class="flex-1"></div>
	</div>
	<div>
		<table class="table border-separate border-spacing-2">
			<thead>
				<tr>
					<th scope="col">Alias</th>
					<th scope="col">Id</th>
					<th scope="col">Url</th>
					<th scope="col">Submitted</th>
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
						<td class="whitespace-nowrap shadow-lg">{read.access}</td>
						<td class="w-20 shadow-lg hover:text-blue-400"
							><a href={origin + '/view/' + read.access} target="_blank">Go to url</a></td
						>
						<td class="m-auto flex justify-center text-center">
							{#if $refresher_i === read.index}
								<svg
									aria-hidden="true"
									class="block h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
									viewBox="0 0 100 101"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
										fill="currentColor"
									/>
									<path
										d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
										fill="currentFill"
									/>
								</svg>
								<span class="sr-only">Loading...</span>
							{:else if $cached_corrections[read.access] != undefined}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="green"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="icon icon-tabler icons-tabler-outline icon-tabler-circle-dashed-check block h-8 w-8"
									><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
										d="M8.56 3.69a9 9 0 0 0 -2.92 1.95"
									/><path d="M3.69 8.56a9 9 0 0 0 -.69 3.44" /><path
										d="M3.69 15.44a9 9 0 0 0 1.95 2.92"
									/><path d="M8.56 20.31a9 9 0 0 0 3.44 .69" /><path
										d="M15.44 20.31a9 9 0 0 0 2.92 -1.95"
									/><path d="M20.31 15.44a9 9 0 0 0 .69 -3.44" /><path
										d="M20.31 8.56a9 9 0 0 0 -1.95 -2.92"
									/><path d="M15.44 3.69a9 9 0 0 0 -3.44 -.69" /><path d="M9 12l2 2l4 -4" /></svg
								>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="red"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="icon icon-tabler icons-tabler-outline icon-tabler-square-rounded-x block h-8 w-8"
									><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
										d="M10 10l4 4m0 -4l-4 4"
									/><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" /></svg
								>{/if}
						</td>
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
{/if}
