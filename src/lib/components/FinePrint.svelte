<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import FanMark from './FanMark.svelte';
	import LanguageSwitch from './LanguageSwitch.svelte';
</script>

<footer aria-labelledby="fine-title" class="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8">
	<div class="rounded-sheet p-6 ring-2 ring-lamp/70 sm:p-10">
		<h2 id="fine-title" class="text-2xl font-bold md:text-3xl">{m.fine_title()}</h2>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-white/90">{m.fine_body()}</p>
		<p class="mt-4 max-w-3xl leading-relaxed text-white/75">{m.fine_privacy()}</p>
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
