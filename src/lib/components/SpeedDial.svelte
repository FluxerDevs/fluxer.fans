<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getFanClub, SPEEDS, type Speed } from '$lib/fan-club.svelte';

	const club = getFanClub();

	const names: Record<Speed, () => string> = {
		0: m.speed_0,
		1: m.speed_1,
		2: m.speed_2,
		3: m.speed_3
	};
</script>

<!-- The page's version of the push buttons on an old desk fan. The fan in the scene has the same keys. -->
<fieldset class="dial">
	<legend class="mb-2 text-sm font-semibold text-white/75">{m.speed_legend()}</legend>
	<div class="flex gap-1.5 rounded-[1.1rem] bg-night-950/80 p-1.5 ring-1 ring-white/10">
		{#each SPEEDS as speed (speed)}
			<label class="key">
				<input
					type="radio"
					name="fan-speed"
					value={speed}
					checked={club.speed === speed}
					onchange={() => club.setSpeed(speed)}
					class="sr-only"
				/>
				<span class="text-lg leading-none font-bold">{speed}</span>
				<span class="text-[0.75rem] leading-tight font-semibold">{names[speed]()}</span>
			</label>
		{/each}
	</div>
</fieldset>

<style>
	.dial {
		min-width: 0;
	}

	.key {
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
		min-height: 3.5rem;
		min-width: 3.5rem;
		padding: 0.4rem 0.35rem 0.5rem;
		border-radius: 0.7rem;
		background: #f6f0e6;
		color: #15122f;
		cursor: pointer;
		user-select: none;
		/* The chunky bottom edge is what makes it read as a physical key. */
		box-shadow:
			inset 0 -5px 0 #cfc5b4,
			0 1px 0 #00000066;
		transition:
			transform 90ms ease-out,
			box-shadow 90ms ease-out,
			background-color 120ms;
	}

	.key:hover {
		background: #fffaf2;
	}

	.key:has(input:checked) {
		background: var(--color-lamp);
		transform: translateY(3px);
		box-shadow:
			inset 0 -2px 0 var(--color-lamp-deep),
			inset 0 2px 4px #7a4a0f55;
	}

	.key:has(input:focus-visible) {
		outline: 3px solid var(--color-lamp);
		outline-offset: 3px;
	}

	.key:has(input:checked:focus-visible) {
		outline-color: #fff;
	}

	@media (prefers-reduced-motion: reduce) {
		.key {
			transition: none;
		}
	}
</style>
