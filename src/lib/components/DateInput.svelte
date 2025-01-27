<script lang="ts">
	import { onMount } from 'svelte';
	import dayjs from 'dayjs';
	import type { ClassValue } from 'svelte/elements';
	import { writable, type Writable } from 'svelte/store';
	import { derived_writable } from '../store';

	let {
		format = 'YYYY-MM-DDTHH:mm',
		date = $bindable(),
		class_,
		disabled = false
	}: {
		format?: string;
		date: Date | undefined;
		class_: ClassValue | undefined | null;
		disabled: boolean;
	} = $props();
	let internal: Writable<any> = writable(date ? dayjs(date).format(format) : undefined);

	$effect(() => {
		$internal = date ? dayjs(date).format(format) : undefined;
	});

	internal.subscribe((v) => {
		const new_date = v ? dayjs(v, format).toDate() : undefined;
		if (new_date != date) date = new_date;
	});
</script>

<input type="datetime-local" bind:value={$internal} class={class_} {disabled} />
