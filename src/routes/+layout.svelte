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

{@render children()}
