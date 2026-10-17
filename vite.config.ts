import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

// Set when the site is served from a subpath, e.g. `/fluxer.fans` on <user>.github.io.
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

// Paraglide's default URL patterns expect the locale as the first path segment,
// so a subpath has to be spelled out for it.
const urlPatterns = base
	? [
			{
				pattern: `:protocol://:domain(.*)::port?${base}/:path(.*)?`,
				localized: [
					['es', `:protocol://:domain(.*)::port?${base}/es/:path(.*)?`],
					['en', `:protocol://:domain(.*)::port?${base}/:path(.*)?`]
				] as [string, string][]
			}
		]
	: undefined;

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// GitHub Pages serves 404.html for any path it can't find.
			adapter: adapter({ fallback: '404.html' }),
			paths: { base }
		}),

		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true,
			// Locale comes from the URL only, so every page can be prerendered.
			strategy: ['url', 'baseLocale'],
			urlPatterns,
			trailingSlash: 'always'
		})
	],
	server: {
		// Reference copies of Fluxer's source from `pnpm fluxer:sync`; not part of the app.
		watch: { ignored: ['**/.fluxer-upstream/**', '**/fluxer-reference/**'] }
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
