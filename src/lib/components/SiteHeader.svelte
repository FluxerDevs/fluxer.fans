<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, localizeHref, type Locale } from '$lib/paraglide/runtime';
	import FanMark from './FanMark.svelte';
	import LanguageSwitch from './LanguageSwitch.svelte';

	const home = resolve(localizeHref('/', { locale: getLocale() as Locale }) as Pathname);
</script>

<!-- Always-visible disclaimer, first thing on every page. -->
<div class="bg-lamp text-night-950">
	<p class="mx-auto max-w-7xl px-4 py-2 text-center text-sm font-semibold sm:px-6 lg:px-8">
		{m.strip_text()}
		<a
			href="https://fluxer.app"
			rel="noopener"
			class="whitespace-nowrap underline decoration-2 underline-offset-2 hover:decoration-night-950/50"
		>
			{m.strip_link()}
		</a>
	</p>
</div>

<header class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
	<a
		href={home}
		aria-label={m.nav_home()}
		aria-current={page.url.pathname === home ? 'page' : undefined}
		class="-ms-1 flex min-h-11 items-center gap-2 rounded-control px-1 text-xl font-bold tracking-tight"
	>
		<FanMark class="size-8 text-white" />
		<span>fluxer<span class="text-brand-light">.fans</span></span>
	</a>
	<div class="ms-auto flex items-center gap-2 sm:gap-3">
		<LanguageSwitch />
		<a
			href="https://fluxer.app"
			rel="noopener"
			class="hidden min-h-10 items-center rounded-full bg-white px-4 text-[0.9375rem] font-bold text-night-950 transition-colors hover:bg-brand-light sm:inline-flex"
		>
			{m.nav_real()}
		</a>
	</div>
</header>
