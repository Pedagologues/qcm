<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import QcmRenderer from '../../../lib/components/QCMRenderer.svelte';
	import type { IQCMQuestionSection, IQCMTextSection } from '../../../lib/types';
	import { cached_documents } from '../../../store';
	import type { PageProps } from './$types';
	import { get, writable, type Writable } from 'svelte/store';

	const { data }: PageProps = $props();

	const error: Writable<string | undefined> = writable(undefined);

	let disabled_submition = writable(
		get(cached_documents)
			[data.access].data.sections.filter((v) => v.type === 'question')
			.map((v) => v as IQCMQuestionSection)
			.filter((v) => v.questions.filter((o) => o.answer).length == 0).length > 0
	);

	const onSubmit = async function () {
		if ($disabled_submition) return;

		const obj = await fetch(origin + '/access/' + data.access + '/answer', {
			method: 'POST',
			body: JSON.stringify(get(cached_documents)[data.access]),
			headers: {
				'content-type': 'application/json'
			}
		}).then((v) => v.json());

		if (obj.error) {
			$error = obj.message;
		}
	};

	const onCheckboxChange = function (e: any) {
		const input_el = e.target as Element;

		const data_id = input_el.getAttribute('data-id');

		if (!data_id) return;

		const [section_i, question_case_j, rest] = data_id
			?.split('.')
			.map((v) => Number(v)) as number[];

		cached_documents.update((v) => {
			const object = v[data.access];

			v[data.access] = {
				...object,
				data: {
					...object.data,
					sections: object.data.sections.map((v, i) => {
						if (i !== section_i) return v;
						const q_section = v as IQCMQuestionSection;

						return {
							...q_section,
							questions: q_section.questions.map((v2, j) => {
								if (j !== question_case_j) return v2;

								return {
									...v2,
									answer: (input_el as any).checked
								};
							})
						};
					})
				}
			};

			return v;
		});

		$disabled_submition =
			get(cached_documents)
				[data.access].data.sections.filter((v) => v.type === 'question')
				.map((v) => v as IQCMQuestionSection)
				.filter((v) => v.questions.filter((o) => o.answer).length == 0).length > 0;
	};

	onMount(() => {
		let inputs = Array(...document.getElementsByTagName('input'));

		let k = 0;

		const sections = data.document.data.sections;

		sections.forEach((section, i) => {
			if (section.type != 'question') return;

			const question_section: IQCMQuestionSection = section as IQCMQuestionSection;

			question_section.questions.forEach((question_case, j) => {
				inputs[k].setAttribute('data-id', i + '.' + j);
				inputs[k].checked = question_case.answer;
				k = k + 1;
			});
		});

		inputs.forEach((v) => {
			v.addEventListener('change', onCheckboxChange);
		});
	});
</script>

<div class="relative flex flex-1 flex-col items-center py-5">
	<div class="w-2/3 rounded-lg bg-surface-800 p-10 shadow-lg">
		<QcmRenderer value={data.document.data.raw} />

		<div class="flex justify-end">
			<button
				class="btn btn-md rounded-sm bg-surface-500 shadow-lg"
				disabled={$disabled_submition}
				onclick={onSubmit}>Submit</button
			>
		</div>
	</div>
</div>

{#if $error != null}
	<div
		class="absolute bottom-0 right-0 m-5 flex flex-row items-center justify-center gap-5 self-center rounded-lg bg-error-500 p-5"
	>
		<div class="flex flex-row gap-5">
			<p class="font-bold">Error :</p>
			<p class="type-scale-1 opacity-60">{$error}</p>
		</div>
		<button class="preset-tonal btn hover:bg-error-900" onclick={() => ($error = undefined)}
			>Dismiss</button
		>
	</div>
{/if}
