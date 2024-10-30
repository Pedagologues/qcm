import type { Plugin } from 'carta-md';
import type { Root, RootContent } from 'mdast';
import type { Plugin as UPlugin } from 'unified';

export type QCMExtensionOptions = {};

const REGEX = /(#\?#\n?)/;

const qcm_plugin: UPlugin<void[], Root> = () => {
	return (tree) => {
		tree.children = tree.children
			.map((node): RootContent[] => {
				if (node.type != 'paragraph') return [node];
				if (!node.children.find((v) => v.type == 'text' && v.value.includes('#?#'))) return [node];
				return [
					{
						type: 'paragraph',
						children: [{ type: 'text', value: '===== NEW QUESTION =====' }]
					}
				];
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
			}
		],
		grammarRules: [
			{
				name: 'question',
				type: 'inline',
				definition: {
					match: '(#\\?#\n+)',
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
						foreground: '#5AF'
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
