<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const editor = page.url.pathname.includes('/editor');
	const access = page.url.pathname.includes('/acces');
</script>

<div class="ali flex w-full flex-row justify-evenly p-5">
	<div class="flex-1"></div>
	<a class="variant-filled btn rounded-md px-5 py-2" href="editor">Editor</a>
	<div class="flex-1"></div>
	<a class="variant-filled btn rounded-md px-5 py-2" href="access">Manage Access</a>
	<div class="flex-1"></div>
</div>
{@render children()}
