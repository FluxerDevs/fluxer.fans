<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { getFanClub } from '$lib/fan-club.svelte';
	import Composer from './Composer.svelte';
	import FanMark from './FanMark.svelte';
	import SpeedDial from './SpeedDial.svelte';

	const club = getFanClub();

	let SceneCanvas = $state<Component<{ shouts: string[] }>>();
	let sceneState = $state<'loading' | 'ready' | 'error'>('loading');
	let section = $state<HTMLElement>();

	const shouts = [
		m.cheer_1(),
		m.cheer_2(),
		m.cheer_3(),
		m.cheer_4(),
		m.cheer_5(),
		m.cheer_6(),
		m.cheer_7(),
		m.cheer_8(),
		m.cheer_9(),
		m.cheer_10()
	];

	function hasWebGL() {
		try {
			const canvas = document.createElement('canvas');
			return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
		} catch {
			return false;
		}
	}

	onMount(() => {
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		club.reducedMotion = motion.matches;
		if (motion.matches) club.setSpeed(0);

		// Stop rendering the scene while the hero is off screen.
		const observer = new IntersectionObserver(([entry]) => {
			club.visible = entry.isIntersecting;
		});
		if (section) observer.observe(section);

		if (!hasWebGL()) {
			sceneState = 'error';
		} else {
			import('$lib/scene/SceneCanvas.svelte')
				.then((mod) => {
					SceneCanvas = mod.default;
					sceneState = 'ready';
				})
				.catch(() => {
					sceneState = 'error';
				});
		}

		return () => observer.disconnect();
	});
</script>

<section
	bind:this={section}
	aria-labelledby="hero-title"
	class="relative isolate flex flex-col lg:block lg:min-h-[max(calc(100svh-7rem),44rem)]"
>
	<div
		class="relative order-2 h-[52svh] max-h-[30rem] min-h-80 lg:absolute lg:inset-0 lg:h-auto lg:max-h-none"
	>
		{#if sceneState === 'ready' && SceneCanvas}
			<div class="h-full" role="img" aria-label={m.scene_label()}>
				<SceneCanvas {shouts} />
			</div>
		{:else if sceneState === 'loading'}
			<div class="grid h-full place-items-center lg:ps-[40%]">
				<p class="flex items-center gap-3 font-semibold text-white/80">
					<FanMark class="size-8 text-brand-light" spinning />
					{m.scene_loading()}
				</p>
			</div>
		{:else}
			<div class="grid h-full place-items-center px-4 lg:ps-[45%]">
				<div class="max-w-sm rounded-card bg-night-600 p-5 ring-1 ring-white/10">
					<FanMark class="mb-3 size-10 text-brand-light" />
					<p class="font-bold">{m.scene_error_title()}</p>
					<p class="mt-1 text-sm text-white/75">{m.scene_error_body()}</p>
				</div>
			</div>
		{/if}
	</div>

	<div
		class="relative z-10 order-1 mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:pointer-events-none lg:px-8 lg:pt-20"
	>
		<div class="max-w-xl lg:pointer-events-auto">
			<h1 id="hero-title" class="text-display font-bold text-balance">
				<span class="block">{m.hero_title_a()}</span>
				<span class="block text-lamp">{m.hero_title_b()}</span>
			</h1>
			<p class="mt-5 max-w-lg text-lg leading-relaxed text-pretty text-white/85">
				{m.hero_lead()}
			</p>
		</div>
	</div>

	<div
		class="relative z-10 order-3 mx-auto w-full max-w-7xl px-4 pt-6 pb-12 sm:px-6 lg:pointer-events-none lg:px-8 lg:pt-10"
	>
		<div class="flex max-w-xl flex-col gap-6 lg:pointer-events-auto">
			{#if sceneState !== 'error'}
				<div class="flex flex-wrap items-end gap-x-4 gap-y-3">
					<SpeedDial />
					<button
						type="button"
						onclick={club.cheerAll}
						class="min-h-14 rounded-control px-4 font-bold text-white ring-2 ring-brand-light/60 transition-colors ring-inset hover:bg-white/10"
					>
						{m.crowd_button()}
					</button>
				</div>
				{#if sceneState === 'ready'}
					<p class="-mt-3 text-sm text-white/70">{m.tap_hint()}</p>
				{/if}
				<Composer />
			{/if}
		</div>
	</div>
</section>
