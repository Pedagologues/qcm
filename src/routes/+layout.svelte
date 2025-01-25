<script lang="ts">
	import { autoModeWatcher } from '@skeletonlabs/skeleton';
	import '../app.css';

	import { initializeStores } from '@skeletonlabs/skeleton';
	let { children } = $props();
	initializeStores();
</script>

<svelte:head>
	{@html '<script>(' + autoModeWatcher.toString() + ')();</script>'}
	<title>QCM</title>
</svelte:head>

<div class="bg-surface-100-800-token flex flex-row justify-between p-5">
	<a class="flex flex-row items-center gap-5 text-center align-middle" href="/">
		<img src="/favicon.svg" class="h-10" alt="icon" />
		<h3 class="h3">QCM</h3>
	</a>
</div>
{@render children()}
