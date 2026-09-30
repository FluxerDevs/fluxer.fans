<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	// Everything here is paraphrased from fluxer.app. Keep it in sync with the official site.
	const channels = [
		{ name: 'chat', text: m.about_chat },
		{ name: 'voice', text: m.about_voice },
		{ name: 'open-source', text: m.about_source },
		{ name: 'self-hosting', text: m.about_selfhost },
		{ name: 'no-investors', text: m.about_indie }
	];
</script>

<section id="fluxer" aria-labelledby="about-title" class="bg-night-950/60 py-20 md:py-28">
	<div class="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
		<div class="lg:sticky lg:top-10 lg:self-start">
			<h2 id="about-title" class="text-4xl font-bold text-balance md:text-5xl">
				{m.about_title()}
			</h2>
			<p class="mt-5 max-w-lg text-lg leading-relaxed text-pretty text-white/85">
				{m.about_lead()}
			</p>
			<a
				href="https://fluxer.app"
				rel="noopener"
				class="mt-8 inline-flex min-h-14 items-center rounded-[0.875rem] bg-brand px-7 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-brand-hover"
			>
				{m.about_cta()}
			</a>
			<p class="mt-4 max-w-md text-sm text-white/70">{m.about_footnote()}</p>
		</div>

		<!-- Laid out like a channel list, the most Fluxer-shaped way to list what Fluxer does. -->
		<div class="rounded-sheet bg-night-600 p-3 ring-1 ring-white/10 sm:p-4">
			<h3 class="px-3 pt-2 pb-3 text-sm font-semibold text-white/70">
				{m.about_channels_label()}
			</h3>
			<ul class="space-y-1">
				{#each channels as channel (channel.name)}
					<li class="rounded-control px-3 py-3 transition-colors hover:bg-white/5">
						<p class="flex items-baseline gap-1.5 font-bold">
							<span class="text-brand-light" aria-hidden="true">#</span>
							{channel.name}
						</p>
						<p class="mt-1 ps-4 leading-relaxed text-white/80">{channel.text()}</p>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
