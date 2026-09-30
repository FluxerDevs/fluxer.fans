<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { interactivity, Sparkles, Stars } from '@threlte/extras';
	import { Object3D, PerspectiveCamera, Vector3 } from 'three';
	import { getFanClub } from '$lib/fan-club.svelte';
	import Breeze from './Breeze.svelte';
	import CheerBubble from './CheerBubble.svelte';
	import Creature, { type Held } from './Creature.svelte';
	import DeskFan from './DeskFan.svelte';
	import Island from './Island.svelte';
	import { createWind, damp, setWind } from './wind';
	import { palette } from './palette';

	let { shouts }: { shouts: string[] } = $props();

	const club = getFanClub();
	setWind(createWind());
	const { size } = useThrelte();

	interactivity();

	const FOV = 30;
	const tanV = Math.tan(((FOV / 2) * Math.PI) / 180);

	// Wide screens put the island on the right so the headline has room on the left.
	// Narrow screens give the canvas its own box, so the island sits in the middle.
	const aspect = $derived($size.width / Math.max(1, $size.height));
	const wide = $derived(aspect > 1.15);
	const islandX = $derived(wide ? Math.min(3.2, 0.8 + aspect * 1.25) : 0);
	const framing = $derived.by(() => {
		const halfWidth = wide ? islandX + 4.7 : 3.5;
		const dist = Math.max(12, halfWidth / (tanV * aspect));
		return {
			y: wide ? 4.6 : 5.2,
			z: dist,
			lookY: wide ? 0.4 : 1.1
		};
	});

	let camera = $state<PerspectiveCamera>();
	let breeze = $state<ReturnType<typeof Breeze>>();

	const lightTarget = new Object3D();
	const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
	const lookAt = new Vector3();

	function onpointermove(e: PointerEvent) {
		pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
		pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
	}

	useTask(
		(delta) => {
			if (!camera) return;
			// Gentle parallax so the diorama feels like a little object you're peeking at.
			const strength = club.reducedMotion ? 0 : 1;
			pointer.sx = damp(pointer.sx, pointer.x * strength, 3, delta);
			pointer.sy = damp(pointer.sy, pointer.y * strength, 3, delta);
			camera.position.set(pointer.sx * 1.2, framing.y - pointer.sy * 0.6, framing.z);
			lookAt.set(0, framing.lookY, 0);
			camera.lookAt(lookAt);
		},
		{ running: () => club.visible }
	);

	type Fan = {
		p: [number, number, number];
		facing: number;
		color: string;
		held: Held;
		scale?: number;
		floaty?: boolean;
	};

	const crowd: Fan[] = [
		{ p: [0.3, 0, 0.7], facing: -0.7, color: palette.brand, held: 'finger' },
		{ p: [1.3, 0, 1.6], facing: -0.45, color: palette.cream, held: 'pennant' },
		{ p: [2.3, 0, 0.35], facing: -0.6, color: palette.brandLight, held: 'handfan' },
		{ p: [0.1, 0, 2.3], facing: -0.3, color: palette.lamp, held: 'scarf', scale: 0.9 },
		{ p: [1.5, 0, -0.6], facing: -0.8, color: palette.brandHover, held: 'finger', scale: 1.1 },
		{
			p: [2.8, 0, 1.5],
			facing: -0.4,
			color: palette.cream,
			held: 'beanie',
			scale: 0.7,
			floaty: true
		}
	];
</script>

<svelte:window {onpointermove} />

<T.PerspectiveCamera bind:ref={camera} makeDefault fov={FOV} near={0.5} far={200} />

<T.HemisphereLight args={['#c9c6ff', '#15122f', 1.6]} />
<T.AmbientLight intensity={0.25} />
<T.DirectionalLight
	position={[islandX - 5, 9, 7]}
	intensity={1.9}
	castShadow
	shadow.mapSize={[1024, 1024]}
	shadow.camera.left={-7}
	shadow.camera.right={7}
	shadow.camera.top={7}
	shadow.camera.bottom={-7}
	shadow.bias={-0.0005}
	shadow.normalBias={0.02}
	target={lightTarget}
/>
<T is={lightTarget} position.x={islandX} />

<Stars radius={70} depth={30} count={900} factor={3} saturation={0} fade speed={0.4} />

<T.Group position.x={islandX}>
	<Island />
	<DeskFan position={[-2.2, 0, -1.2]} yaw={0.75} />
	{#each crowd as fan, i (i)}
		<Creature
			position={fan.p}
			facing={fan.facing}
			color={fan.color}
			held={fan.held}
			scale={fan.scale}
			floaty={fan.floaty}
			seed={i}
			{shouts}
			oncheer={(at) => breeze?.burst(at)}
		/>
	{/each}
	<Sparkles
		count={28}
		scale={[7, 3, 6]}
		position={[0.5, 1.8, 0]}
		color={palette.lamp}
		size={4}
		speed={0.25}
		opacity={0.8}
	/>
</T.Group>

<Breeze bind:this={breeze} {islandX} islandRadius={4.1} />

{#each club.cheers as cheer (cheer.id)}
	<CheerBubble {cheer} />
{/each}
