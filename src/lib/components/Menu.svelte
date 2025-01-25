<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import type { MouseEventHandler } from 'svelte/elements';

	const modal = getModalStore();

	const edit_modal_settings: ModalSettings = {
		type: 'prompt',
		title: 'Enter Access',
		body: 'Please write the access key in the field below',

		value: '',
		valueAttr: { type: 'text', minlength: 36, maxlength: 36, required: true },

		response: (r: any) => {
			if (!r) modal.close();
			else goto(page.url.origin + '/edit/' + r);
		}
	};

	const openEditModal: MouseEventHandler<any> = function (event) {
		modal.trigger(edit_modal_settings);
	};
</script>

<div class="flex flex-col rounded-md bg-surface-600 p-10">
	<a href="/">
		<div class="flex flex-row items-center justify-center">
			<img class="w-1/2" src="favicon.png" alt="icon" />
		</div>
	</a>
	<div class="m-4 h-1 rounded-sm bg-surface-900"></div>

	<div class="flex flex-col">
		<a class="m-2 p-4 hover:bg-surface-500" href="new"> Write a new document </a>
		<button class="m-2 p-4 text-left hover:bg-surface-500" onclick={openEditModal}>
			Edit a document
		</button>
		<a class="m-2 p-4 hover:bg-surface-500" href="view"> View a document </a>
	</div>

	<div class="m-4 h-1 rounded-sm bg-surface-900"></div>
</div>
