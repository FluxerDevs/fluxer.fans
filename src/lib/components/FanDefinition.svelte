<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	const senses = [
		{ n: 1, text: m.def_1, example: m.def_1_example },
		{ n: 2, text: m.def_2, example: m.def_2_example }
	];
</script>

<!-- The whole pun, spelled out like a dictionary entry. -->
<section
	aria-labelledby="def-word"
	class="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-12 lg:gap-8 lg:px-8"
>
	<div class="lg:col-span-5">
		<p class="text-sm font-semibold text-brand-light">{m.def_kicker()}</p>
		<h2
			id="def-word"
			class="mt-2 text-[clamp(5.5rem,4rem+10vw,11rem)] leading-[0.85] font-bold tracking-tight"
		>
			{m.def_word()}
		</h2>
		<p class="mt-4 text-lg text-white/75">
			<span class="font-semibold text-white">/fæn/</span>
			<span class="italic">{m.def_pos()}</span>
		</p>
	</div>

	<div class="lg:col-span-7 lg:pt-10">
		<ol class="space-y-10">
			{#each senses as sense (sense.n)}
				<li class="flex gap-5">
					<!-- Numbered with the same keys as the fan speed buttons. -->
					<span
						aria-hidden="true"
						class="grid size-12 shrink-0 place-items-center rounded-[0.7rem] bg-[#f6f0e6] text-xl font-bold text-night-950 shadow-[inset_0_-5px_0_#cfc5b4]"
					>
						{sense.n}
					</span>
					<div>
						<p class="text-2xl leading-snug font-semibold text-balance md:text-3xl">
							{sense.text()}
						</p>
						<p class="mt-2 text-lg text-white/75 italic">“{sense.example()}”</p>
					</div>
				</li>
			{/each}
		</ol>
		<p class="mt-12 border-t border-white/15 pt-6 text-xl font-semibold text-lamp">
			{m.def_outro()}
		</p>
	</div>
</section>
