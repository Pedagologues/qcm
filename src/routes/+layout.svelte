<script lang="ts">
	import { autoModeWatcher, Modal } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import '../app.css';

	let { children } = $props();

	initializeStores();
</script>

<svelte:head>
	<title>QCM</title>
</svelte:head>

<div class="flex h-svh flex-col">
	<div class="bg-surface-100-800-token flex flex-row justify-between p-5">
		<a class="flex flex-row items-center gap-5 text-center align-middle" href="/">
			<img src="/favicon.svg" class="h-10" alt="icon" />
			<h3 class="h3">QCM</h3>
		</a>
	</div>
	<Modal />
	{@render children()}
</div>
