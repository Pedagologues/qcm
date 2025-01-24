import type { Config } from 'tailwindcss';

import { skeleton } from '@skeletonlabs/tw-plugin';
import { join } from 'path';

export default {
	darkMode: 'media',

	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],

	theme: {
		extend: {}
	},

	plugins: [
		skeleton({
			themes: { preset: ['skeleton'] }
		})
	]
} satisfies Config;
