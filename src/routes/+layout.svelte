<script lang="ts">
	import '../app.css';

	import { initializeStores } from '@skeletonlabs/skeleton';
	let { children } = $props();
	initializeStores();
</script>

<svelte:head>
	<title>QCM</title>
</svelte:head>
<div class=" flex flex-col">
	<div class="bg-surface-100-800-token flex flex-row justify-between p-5">
		<a href="/"><h3 class="h3">QCM</h3></a>
		<!-- <LightSwitch /> -->
	</div>
	<div class="relative">
		{@render children()}
	</div>
</div>
