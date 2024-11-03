<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ensureDocumentType } from '$lib/database/DocumentManipulator.js';
	import { qcm } from '$lib/plugin-qcm/qcm.js';
	import { tailwind } from '$lib/plugin-tailwind/tailwind.js';
	import type IAnswer from '$lib/types/IAnswer.js';
	import type { PerQuestionAnswer } from '$lib/types/IAnswer.js';
	import type { IAnswerValidation } from '$lib/types/IAnswerValidation.js';
	import type IDocument from '$lib/types/IDocument.js';
	import type ILocalDocument from '$lib/types/ILocalDocument.js';
	import { code } from '@cartamd/plugin-code';
	import { math } from '@cartamd/plugin-math';
	import { slash } from '@cartamd/plugin-slash';
	import { tikz } from '@cartamd/plugin-tikz';
	import { Carta, Markdown } from 'carta-md';
	import { local_answers, local_documents } from '../../store.js';

	let { data } = $props();

	let { doc: raw_db_doc, edit } = data;

	if (browser && edit) {
		const newId = $local_documents.map((v) => v.local_id).reduce((x, y) => (x > y ? x : y), 0) + 1;

		const doc: ILocalDocument = {
			...ensureDocumentType(raw_db_doc),
			sent: new Date(),
			local_id: newId
		};

		$local_documents = $local_documents.filter((v) => v.id == -1 || v.id != doc.id).concat(doc);

		goto('/');
	}

	const db_doc = raw_db_doc as IDocument;

	let answers = $state({
		get value() {
			return $local_answers.find((v) => v.qcm_id === db_doc.id) as IAnswer;
		},

		set value(v) {
			$local_answers = $local_answers.map((o) => (o.qcm_id === db_doc.id ? v : o));
		}
	});

	if (
		!answers.value ||
		!answers.value.version ||
		answers.value.version !== db_doc.updated.toString()
	) {
		const v = {
			qcm_id: db_doc.id,
			view: db_doc.view as string,
			version: db_doc.updated.toString(),
			answers: []
		};

		$local_answers = $local_answers.filter((v) => v.qcm_id != db_doc.id).concat(v);
		answers.value = v;
	}

	let query = new URLSearchParams($page.url.searchParams.toString());
	const [about, ...questions] = (db_doc?.data || '').split('#?#');

	let is_viewing_about = $state((query.get('about') || '1') === '1');
	$effect(() => {
		query.set('about', is_viewing_about ? '1' : '0');
		goto(`?${query.toString()}`, { replaceState: true });
	});

	let current_page = $state(Number.parseInt(query.get('page') || '-1'));
	$effect(() => {
		query.set('page', current_page.toString());
		goto(`?${query.toString()}`, { replaceState: true });
	});

	let validated: IAnswerValidation[] | undefined = $state(undefined);
	$inspect(validated);

	// let current_page = $state(-1);
	const carta = new Carta({
		sanitizer: false,
		extensions: [math(), code(), slash(), tikz(), qcm({ view: true }), tailwind()]
	});

	const validated_carta = new Carta({
		sanitizer: false,
		extensions: [math(), code(), slash(), tikz(), tailwind()]
	});

	function onclick(e: MouseEvent) {
		if ((e.target as any).nodeName !== 'INPUT') return;
		const checked = (e.target as any).checked || false;
		const id = (e.target as any).id.substring('answer_'.length);

		const newAnswers: PerQuestionAnswer[] = (answers.value?.answers || []).map((v) => {
			return v.question !== current_page.toString()
				? v
				: {
						question: current_page.toString(),
						element: checked ? v.element.concat(id) : v.element.filter((o) => o !== id)
					};
		});

		if (!newAnswers.find((o) => o.question === current_page.toString()) && checked) {
			newAnswers.push({
				question: current_page.toString(),
				element: [id]
			});
		}

		answers.value = {
			qcm_id: db_doc.id,
			version: db_doc.updated.toString(),
			view: db_doc.view as string,
			answers: newAnswers
				.filter((v) => v.element.length != 0)
				.reduce((x, y) => {
					return x.find((v) => v.question == y.question) ? x : x.concat(y);
				}, [] as PerQuestionAnswer[])
		};
	}

	$effect(() => {
		is_viewing_about;
		const saved = answers.value?.answers.find((v) => v.question === current_page.toString());
		if (!saved) return;
		document.querySelectorAll('input').forEach((input) => {
			if (!input.id.startsWith('answer_')) return;
			const id = input.id.substring('answer_'.length);
			input.checked = saved.element.includes(id);
		});
	});
</script>

<div class="flex flex-col justify-center align-middle">
	<div class="my-5 w-4/5 self-center">
		{#if validated}
			{#each validated as va}
				<div class={'m-2 rounded p-5 ' + (!va.correct ? 'bg-red-400' : '')}>
					Question n° {va.question} : {va.correct ? 'CORRECT' : 'FAUX'}

					<div>
						Votre réponse
						<Markdown
							carta={validated_carta}
							value={va.answer.join('').replaceAll('- [X]', '-').trim()}
						/>

						{#if !va.correct}
							<br />
							La réponse
							<Markdown
								carta={validated_carta}
								value={va.valid.join('').replaceAll('- [X]', '-').trim()}
							/>
						{/if}
					</div>
				</div>
			{/each}
		{:else}
			<div class=" rounded bg-slate-50 p-4">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="m-5 self-center" {onclick}>
					{#if is_viewing_about}
						<Markdown {carta} value={about} />
					{:else}
						{#key current_page}
							<Markdown {carta} value={questions[current_page]} />
						{/key}
					{/if}
				</div>
			</div>
			<div class="my-2 flex flex-row">
				{#if !is_viewing_about}
					<button class="variant-filled btn" onclick={() => (is_viewing_about = true)}>About</button
					>
				{/if}

				<div class="flex-1"></div>

				<button
					class="variant-filled btn"
					disabled={(answers.value?.answers?.length || 0) !== questions.length}
					onclick={async (e) => {
						const response = await fetch('/qcm', {
							method: 'POST',
							body: JSON.stringify(answers.value),
							headers: {
								'Content-Type': 'application/json'
							}
						});

						validated = await response.json();
					}}>Valider</button
				>
				<div class="flex-1"></div>

				{#if is_viewing_about}
					{#if current_page == -1}
						<button
							class="variant-filled btn"
							onclick={() => {
								is_viewing_about = false;
								current_page = 0;
							}}>Démarrer</button
						>
					{:else}
						<button
							class="variant-filled btn"
							onclick={() => {
								is_viewing_about = false;
							}}>Revenir au QCM</button
						>
					{/if}
				{:else}
					<div class="flex flex-row gap-5">
						<button
							class="variant-filled btn"
							disabled={current_page <= 0}
							onclick={() => (current_page = Math.max(0, current_page - 1))}>Précédent</button
						>
						<button
							class="variant-filled btn"
							disabled={current_page >= questions.length - 1}
							onclick={() => (current_page = Math.min(questions.length - 1, current_page + 1))}
							>Suivant</button
						>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
