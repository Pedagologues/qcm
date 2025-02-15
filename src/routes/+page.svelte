<script lang="ts">
	import Menu from '../lib/components/Menu.svelte';
	import { cached_documents, cached_answers } from '../store';
</script>

<div
	class="absolute left-0 top-0 flex h-full w-full flex-row items-center justify-around bg-gray-700"
>
	<div
		class="ml-10 flex h-2/3 w-2/6 flex-col items-center justify-center rounded-lg border-4 bg-gray-500"
	>
		<div class="m-0 flex h-1 w-full flex-1 flex-col items-start justify-start rounded-sm bg-none">
			<div class="h-10 w-full justify-center border-b">
				<div class="m-1 flex flex-1 justify-center">Local Documents</div>
			</div>

			<div class="mx-2 my-4 flex w-full flex-1 flex-col">
				<ul class="list flex-1 mr-10">
					{#each Object.keys($cached_documents) as doc}
						<li class="list-item">
							<a class="flex-1 p-2 rounded-lg flex hover:bg-surface-200" target="_blank" href={"/edit/"+doc}>
								<div class="flex flex-1 flex-row justify-center">
									<div>{$cached_documents[doc].title}</div>
									<div class="flex-1"></div>
									<div>Edited : {new Date($cached_documents[doc].updated).toLocaleString()}</div>
								</div>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
	<div class="flex h-full w-1/5 items-center justify-center">
		<Menu />
	</div>
	<div
		class="mr-10 flex h-2/3 w-2/6 flex-col items-center justify-center rounded-lg border-4 bg-gray-500"
	>
		<div class="m-0 flex h-1 w-full flex-1 flex-col items-start justify-start rounded-sm bg-none">
			<div class="h-10 w-full justify-center border-b">
				<div class="m-1 flex flex-1 justify-center">Local Answers</div>
			</div>

			<div class="mx-2 my-4 flex w-full flex-1 flex-col">
				<ul class="list flex-1 mr-10">
					{#each Object.keys($cached_answers) as doc}
						<li class="list-item">
							<a class="flex-1 p-2 rounded-lg flex hover:bg-surface-200" target="_blank" href={"/view/"+doc}>
								<div class="flex flex-1 flex-col justify-center">
									<div class="flex flex-1 flex-row">
										<div>{$cached_answers[doc].title}</div>
										<div class="flex-1"></div>
										<div>Edited : {new Date($cached_answers[doc].updated).toLocaleString()}</div>7
									</div>
									Access : {doc}
								</div>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>
