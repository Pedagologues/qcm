import type { Plugin } from 'carta-md';
import type { Root as HRoot } from 'hast';
import type { Root, RootContent } from 'mdast';
import type { Plugin as UPlugin } from 'unified';
import { visit } from 'unist-util-visit';

export type QCMExtensionOptions = {
	view: boolean;
};

const REGEX = /(\n#\?#\n?)/;

const qcm_plugin: UPlugin<void[], Root> = () => {
	return (tree) => {
		tree.children = tree.children
			.map((node): RootContent[] => {
				if (node.type != 'paragraph') return [node];
				if (!node.children.find((v) => v.type == 'text' && v.value.includes('\n#?#')))
					return [node];
				if (node.children.find((v) => v.type == 'text' && v.value.split('\n#?#').length > 2))
					return [node];

				console.log(node);

				const missingChild: RootContent[] = [];

				node.children.forEach((v, i) => {
					if (v.type !== 'text') missingChild.push(v);
					else {
						const txt = v.value;
						if (!txt.includes('\n#?#')) missingChild.push(v);
						else {
							txt.split('\n#?#').forEach((o, j) => {
								if (o.trim().length !== 0) {
									missingChild.push({
										type: 'paragraph',
										children: [{ type: 'text', value: o }]
									});
								}
								if (o.trim().length !== 0 || j == 0)
									missingChild.push({
										type: 'paragraph',
										children: [{ type: 'text', value: '===== NEW QUESTION =====' }]
									});
							});
						}
					}
				});

				return missingChild;
			})
			.flat();
	};
};

export const qcm = (options?: QCMExtensionOptions): Plugin => {
	return {
		transformers: [
			{
				execution: 'sync',
				type: 'remark',
				transform({ processor: n }): void {
					n.use(qcm_plugin);
				}
			},
			{
				execution: 'sync',
				type: 'rehype',
				transform({ processor }): void {
					if (options?.view)
						processor.use(() => {
							return (tree: HRoot) => {
								let i = 0;
								visit(tree, (node, index, parent) => {
									if (node.type !== 'element') return;
									if (node.tagName !== 'input') return;
									node.properties.checked = undefined;
									node.properties.disabled = undefined;
									node.properties.id = 'answer_' + i;
									i += 1;
								});
							};
						});
				}
			}
		],
		grammarRules: [
			{
				name: 'question',
				type: 'inline',
				definition: {
					match: '(^#\\?#\n+)',
					name: 'markup.inline.question',
					captures: {
						'1': { name: 'marker.definition.question.inline' }
					}
				}
			}
		],
		highlightingRules: [
			{
				light: {
					scope: 'marker.definition.question',
					settings: {
						foreground: '#0b0'
					}
				},
				dark: {
					scope: 'marker.definition.question',
					settings: {
						foreground: '#4DACFA'
					}
				}
			}
		]
	};
};
