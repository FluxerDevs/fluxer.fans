<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, locales, localizeHref, type Locale } from '$lib/paraglide/runtime';

	const names: Record<Locale, () => string> = { en: m.lang_en, es: m.lang_es };
	const current = getLocale();
</script>

<nav aria-label={m.lang_label()}>
	<ul class="flex rounded-full bg-night-600 p-1 ring-1 ring-white/10">
		{#each locales as locale (locale)}
			<li>
				<!-- Full reload so every message re-renders in the new language. -->
				<a
					href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}
					hreflang={locale}
					lang={locale}
					data-sveltekit-reload
					aria-current={locale === current ? 'true' : undefined}
					title={names[locale]()}
					class="flex min-h-11 min-w-11 items-center justify-center rounded-full px-2.5 text-sm font-bold uppercase {locale ===
					current
						? 'bg-brand text-white'
						: 'text-white/75 hover:text-white'}"
				>
					{locale}
					<span class="sr-only">({names[locale]()})</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
