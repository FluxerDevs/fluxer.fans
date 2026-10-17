<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import FanMark from './FanMark.svelte';
	import LanguageSwitch from './LanguageSwitch.svelte';

	const COMMUNITY_INVITE = 'https://fluxer.gg/dh9m2Iqo';
</script>

<footer aria-labelledby="fine-title" class="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8">
	<div class="rounded-sheet p-6 ring-2 ring-lamp/70 sm:p-10">
		<h2 id="fine-title" class="text-2xl font-bold md:text-3xl">{m.fine_title()}</h2>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-white/90">{m.fine_body()}</p>
		<p class="mt-4 max-w-3xl leading-relaxed text-white/75">{m.fine_privacy()}</p>
	</div>

	<div
		class="mt-6 flex flex-col gap-5 rounded-sheet bg-night-600 p-6 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between sm:p-8"
	>
		<p class="max-w-xl text-lg leading-relaxed text-white/90">{m.more_body()}</p>
		<a
			href={COMMUNITY_INVITE}
			rel="noopener"
			class="inline-flex min-h-14 shrink-0 items-center justify-center rounded-[0.875rem] bg-brand px-7 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-brand-hover"
		>
			{m.more_cta()}
		</a>
	</div>

	<div
		class="mt-10 flex flex-col gap-6 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between"
	>
		<p class="flex items-center gap-2">
			<FanMark class="size-5 text-white/80" />
			<span>{m.fine_built()}</span>
		</p>
		<LanguageSwitch />
	</div>
</footer>
