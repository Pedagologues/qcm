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

<div class="flex-1 flex bg-surface-600 flex-col h-full rounded-md justify-center items-center p-2">
	<a href="/">
		<div class="flex flex-row items-center justify-center">
			<img class="w-full" src="favicon.png" alt="icon" />
		</div>
	</a>
	<div class="m-4 w-full h-1 rounded-sm bg-surface-900"></div>
	<div class="flex flex-col flex-1 justify-center align-middle">
		<a class="m-2 p-4 hover:bg-surface-500" href="new"> Write a new document </a>
		<button class="m-2 p-4 text-left hover:bg-surface-500" onclick={openEditModal}>
			Edit a document
		</button>
		<a class="m-2 p-4 hover:bg-surface-500" href="view"> View a document </a>
	</div>
</div>
