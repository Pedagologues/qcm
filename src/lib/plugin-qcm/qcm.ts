import type { Plugin } from 'carta-md';
import type { Root as HRoot } from 'hast';
import type { Root, RootContent } from 'mdast';
import type { Plugin as UPlugin } from 'unified';

export type QCMExtensionOptions = {
	view: boolean;
};

const REGEX = /(\n#\?#\n?)/;

const qcm_plugin: UPlugin<void[], Root> = () => {
	let section_creator = (
		list: RootContent[],
		indexer: Map<string, number>,
		sanitizer: (v: string) => string,
		title: string | undefined
	): RootContent[] => {
		if (list.length == 0) return [];

		let type = '';
		if (JSON.stringify(list).includes('"tagName":"input"')) type = 'Question';
		else type = 'Text';

		indexer.set(sanitizer(type), (indexer.get(sanitizer(type)) || 0) + 1);

		let real_title = type + ' #' + indexer.get(sanitizer(type));

		if (title) {
			const v = indexer.get(sanitizer(title));
			if (v) {
				real_title = title + ' #' + v;
			} else {
				real_title = title;
			}
			indexer.set(sanitizer(title), (v || 0) + 1);
		}

		return [
			{
				type: 'element',
				tagName: 'div',
				children: [
					{
						type: 'element',
						tagName: 'div',
						children: [
							{
								type: 'text',
								value: real_title
							}
						],
						properties: {
							className: ['question-section-title']
						}
					},
					{
						type: 'element',
						tagName: 'section',
						children: Array(...list),
						properties: {
							className: ['question-section-body']
						}
					}
				],
				properties: {
					className: ['question-section']
				}
			}
		] as any;
	};

	return (tree) => {
		let stack: RootContent[] = [];

		let indexer: Map<string, number> = new Map();

		let sanitizer = (v: string): string => v.replace(RegExp('\s+'), '-');

		let last_title: string | undefined = undefined;

		tree.children = tree.children
			.map((node): RootContent[] => {
				if ((node.type as string) !== 'element') {
					stack.push(node);
					return [];
				}

				const REGEX2 = /^(#\?#)(\s*\((.*)\))?\s*$/;
				const children: any[] = (node as any).children;
				if (!(children.length === 1 && REGEX2.test(children[0].value))) {
					stack.push(node);
					return [];
				}

				const text = children[0].value;

				const newNode = section_creator(stack, indexer, sanitizer, last_title);

				last_title = (REGEX2.exec(text) || [])[3] || undefined;

				stack = [];

				return newNode;
			})
			.flat();
		tree.children.push(...section_creator(stack, indexer, sanitizer, last_title));
	};
};

export const qcm = (options?: QCMExtensionOptions): Plugin => {
	return {
		transformers: [
			{
				execution: 'sync',
				type: 'rehype',
				transform({ processor }): void {
					processor.use(qcm_plugin);
				}
			}
		]
	};
};
