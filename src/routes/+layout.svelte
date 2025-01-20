<script lang="ts">
	import '../app.css';

	import { initializeStores } from '@skeletonlabs/skeleton';
	let { children } = $props();
	initializeStores();
</script>

<svelte:head>
	<title>QCM</title>
	<!-- <link rel="icon" type="image/svg" href={'favicon.png'} /> -->
</svelte:head>
<div class=" flex flex-col">
	<div class="bg-surface-100-800-token flex flex-row justify-between p-5">
		<a class="flex flex-row items-center gap-5 text-center align-middle" href="/">
			<img src="favicon.svg" class="h-10" alt="icon" />
			<h3 class="h3">QCM</h3>
		</a>
		<!-- <LightSwitch /> -->
	</div>
	<div class="relative">
		{@render children()}
	</div>
</div>
