<script lang="ts">
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import Menu from '../lib/components/Menu.svelte';
	import { cached_documents, cached_answers } from '../store';

	const modalStore = getModalStore();
	let write_suppression: string | undefined = undefined;
	const write_suppression_modal: ModalSettings = {
		type: 'confirm',
		// Data
		title: 'Please Confirm',
		body: 'Are you sure you wish to proceed?',
		// TRUE if confirm pressed, FALSE if cancel pressed
		response: (r: boolean) => {
			if (write_suppression !== undefined && r) {
				cached_documents.update((v) => {
					delete v[write_suppression as string];
					return v;
				});
			}
			write_suppression = undefined;
		}
	};

	let answer_suppression: string | undefined = undefined;
	const answer_suppression_modal: ModalSettings = {
		type: 'confirm',
		// Data
		title: 'Please Confirm',
		body: 'Are you sure you wish to proceed?',
		// TRUE if confirm pressed, FALSE if cancel pressed
		response: (r: boolean) => {
			if (answer_suppression !== undefined && r) {
				cached_answers.update((v) => {
					delete v[answer_suppression as string];
					return v;
				});
			}
			answer_suppression = undefined;
		}
	};
</script>

<div
	class="absolute left-0 top-0 flex h-full w-full flex-row items-center justify-around bg-gray-700"
>
	<div
		class="ml-10 flex h-2/3 w-2/6 flex-col items-center justify-center rounded-lg border-4 bg-gray-500"
	>
		<div class="m-0 flex h-1 w-full flex-1 flex-col items-start justify-start rounded-sm bg-none">
			<div class="h-10 w-full justify-center border-b">
				<div class="m-1 flex flex-1 justify-center">Local Documents</div>
			</div>

			<div class="mx-2 my-4 flex w-full flex-1 flex-col">
				<ul class="list mr-10 flex-1">
					{#each Object.keys($cached_documents) as doc}
						<li class="list-item">
							<div class="flex flex-1 flex-row justify-center">
								<a
									class="hover:bg-surface-200 flex flex-1 rounded-lg p-2"
									target="_blank"
									href={'/edit/' + doc}
								>
									<div>{$cached_documents[doc].title}</div>
									<div class="flex-1"></div>
									<div>Edited : {new Date($cached_documents[doc].updated).toLocaleString()}</div>
								</a>
								<div class="min-w-5"></div>
								<button
									class="text-red-500 hover:bg-red-900"
									on:click={() => {
										write_suppression = doc;
										modalStore.trigger(write_suppression_modal);
									}}>X</button
								>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
	<div class="flex h-full w-1/5 items-center justify-center">
		<Menu />
	</div>
	<div
		class="mr-10 flex h-2/3 w-2/6 flex-col items-center justify-center rounded-lg border-4 bg-gray-500"
	>
		<div class="m-0 flex h-1 w-full flex-1 flex-col items-start justify-start rounded-sm bg-none">
			<div class="h-10 w-full justify-center border-b">
				<div class="m-1 flex flex-1 justify-center">Local Answers</div>
			</div>

			<div class="mx-2 my-4 flex w-full flex-1 flex-col">
				<ul class="list mr-10 flex-1">
					{#each Object.keys($cached_answers) as doc}
						<li class="list-item">
							<div class="flex flex-1 flex-col justify-center">
								<div class="flex flex-1 flex-row">
									<a
										class="hover:bg-surface-200 flex flex-1 rounded-lg p-2"
										target="_blank"
										href={'/view/' + doc}
									>
										<div>{$cached_answers[doc].title}</div>
										<div class="flex-1"></div>
										<div>Edited : {new Date($cached_answers[doc].updated).toLocaleString()}</div>
									</a>
									<div class="min-w-5"></div>
									<button
										class="text-red-500 hover:bg-red-900"
										on:click={() => {
											answer_suppression = doc;
											modalStore.trigger(answer_suppression_modal);
										}}>X</button
									>
								</div>
								Access : {doc}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>
