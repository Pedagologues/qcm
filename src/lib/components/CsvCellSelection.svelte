<script lang="ts">
	import Papa from 'papaparse';
	import { writable } from 'svelte/store';

	const {
		raw_csv,
		onSubmit = () => {}
	}: {
		raw_csv: string[][];
		onSubmit: (v: string[]) => void;
	} = $props();

	const selected_rows = writable(raw_csv.map(() => true));
	const selected_cols = writable(raw_csv[0].map(() => true));

	const onRawSubmit = () => {
		onSubmit(
			raw_csv
				.filter((v, i) => $selected_rows[i])
				.map((row) => row.filter((v, i) => $selected_cols[i]))
				.map((row) => row.join(' '))
		);
	};

	$inspect($selected_cols);
	$inspect($selected_rows);
</script>

<div class="text-center text-primary-400">
	Click on columns and rows to gray out the one you don't want to use in the import
	<br />

	Alias will be the columns concatenated
</div>
<table class="c_table border-separate border-spacing-2">
	<tbody>
		<tr>
			<td
				class="flex cursor-pointer justify-center text-2xl hover:bg-surface-500"
				onclick={onRawSubmit}>Submit</td
			>
			{#each raw_csv[0].map((v, i) => i) as cell}
				<td
					class={$selected_cols[cell] ? 'bg-surface-700' : 'bg-gray-600'}
					onclick={() => {
						selected_cols.update((v) => {
							v[cell] = !v[cell];

							return v;
						});
					}}>{cell + 1}</td
				>
			{/each}
		</tr>
		{#each raw_csv.map((v, i) => {
			return { data: v, index: i };
		}) as row}
			<tr class={$selected_rows[row.index] ? 'bg-surface-700' : 'bg-gray-600'}>
				<td
					onclick={() => {
						selected_rows.update((v) => {
							v[row.index] = !v[row.index];

							return v;
						});
					}}>{row.index + 1}</td
				>
				{#each row.data.map((v, i) => {
					return { data: v, index: i };
				}) as cell}
					<td
						class={$selected_cols[cell.index] && $selected_rows[row.index]
							? 'bg-surface-700'
							: 'bg-gray-600'}>{cell.data}</td
					>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.c_table {
		display: table;
		background-color: rgb(var(--color-surface-800));
		width: 100%;
		table-layout: auto;
		overflow: hidden;
		background-color: rgb(var(--color-surface-900));
		border-radius: var(--theme-rounded-container);
		display: table;
	}
	.c_table tbody tr {
		border-bottom-width: 1px;
		border-color: rgb(var(--color-surface-500) / 0.2);
		--tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		--tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
			0 4px 6px -4px var(--tw-shadow-color);

		box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
			var(--tw-shadow);
	}
	.c_table tbody td {
		white-space: nowrap;
		padding-left: 0.75rem /* 12px */;
		padding-right: 0.75rem /* 12px */;
		padding-top: 1rem /* 16px */;
		padding-bottom: 1rem /* 16px */;
		vertical-align: top;
		font-size: 0.875rem /* 14px */;
		line-height: 1.25rem /* 20px */;

		--tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		--tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
			0 4px 6px -4px var(--tw-shadow-color);

		box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
			var(--tw-shadow);
	}
	@media (min-width: 768px) {
		.c_table tbody td {
			white-space: normal;
		}
	}
</style>
