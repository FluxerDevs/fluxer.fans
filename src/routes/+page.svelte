<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { FanClub, setFanClub } from '$lib/fan-club.svelte';
	import AboutFluxer from '$lib/components/AboutFluxer.svelte';
	import FanDefinition from '$lib/components/FanDefinition.svelte';
	import FinePrint from '$lib/components/FinePrint.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	setFanClub(new FanClub());
</script>

<svelte:head>
	<title>{m.meta_title()}</title>
	<meta name="description" content={m.meta_description()} />
	<meta property="og:title" content={m.meta_title()} />
	<meta property="og:description" content={m.meta_description()} />
	<meta property="og:type" content="website" />
</svelte:head>

<a
	href="#main"
	class="sr-only z-50 rounded-control bg-white px-4 py-3 font-bold text-night-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
>
	{m.skip_link()}
</a>

<SiteHeader />

<main id="main">
	<Hero />
	<FanDefinition />
	<AboutFluxer />
</main>

<FinePrint />
