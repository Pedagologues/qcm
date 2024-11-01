import type { Plugin } from 'carta-md';
import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

export type TailwindExtensionOptions = {};

function mapper(v: string): string | undefined {
	switch (v) {
		case 'h1':
			return 'h1';
		case 'h2':
			return 'h2';
		case 'h3':
			return 'h3';
		case 'h4':
			return 'h4';
		case 'h5':
			return 'h5';
		case 'h6':
			return 'h6';
		case 'strong':
			return 'font-bold';
		case 'em':
			return 'em';
		case 'ul':
			return 'list-disc list-inside';
		case 'ol':
			return 'list-decimal list-inside';
	}
}

export const tailwind = (options?: TailwindExtensionOptions): Plugin => {
	return {
		transformers: [
			{
				execution: 'sync',
				type: 'rehype',
				transform({ processor }): void {
					processor.use(() => {
						return (tree: Root) => {
							visit(tree, (node, index, parent) => {
								if (node.type !== 'element') return;

								const element = node as Element;
								element.properties.class = mapper(element.tagName);
							});
						};
					});
				}
			}
		]
	};
};
