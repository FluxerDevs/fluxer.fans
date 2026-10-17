<script lang="ts">
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
				<!-- eslint-disable svelte/no-navigation-without-resolve -- localizeHref output already includes the base path -->
				<a
					href={localizeHref(page.url.pathname, { locale })}
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
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</li>
		{/each}
	</ul>
</nav>
