<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Outlines } from '@threlte/extras';
	import { Group, Vector3 } from 'three';
	import { getFanClub } from '$lib/fan-club.svelte';
	import { damp, exposureAt, getWind } from './wind';
	import { OUTLINE, palette } from './palette';

	const club = getFanClub();
	const wind = getWind();

	let plant = $state<Group>();
	const plantWorld = new Vector3();

	const leaves = [
		{ angle: 0, tilt: 0.5, len: 0.55 },
		{ angle: 1.3, tilt: 0.7, len: 0.48 },
		{ angle: 2.5, tilt: 0.45, len: 0.6 },
		{ angle: 3.7, tilt: 0.75, len: 0.45 },
		{ angle: 5, tilt: 0.55, len: 0.52 }
	];

	// Little rocks hanging off the bottom of the floating island.
	const rocks = [
		{ p: [1.6, -2.3, 0.9], s: 0.35 },
		{ p: [-1.2, -2.6, -0.4], s: 0.28 },
		{ p: [0.2, -3.2, 0.3], s: 0.22 }
	] as const;

	useTask(
		(delta) => {
			if (!plant) return;
			plant.getWorldPosition(plantWorld);
			const gust = exposureAt(wind, plantWorld);
			const sway = Math.sin(wind.time * (3 + gust * 14)) * (0.04 + gust * 0.2);
			plant.rotation.z = damp(plant.rotation.z, -wind.dir.x * gust * 0.4 + sway, 8, delta);
			plant.rotation.x = damp(plant.rotation.x, wind.dir.z * gust * 0.4, 8, delta);
		},
		{ running: () => club.visible }
	);
</script>

<!-- Island top and underside -->
<T.Mesh position.y={-0.2} receiveShadow>
	<T.CylinderGeometry args={[4.2, 4.0, 0.4, 48]} />
	<T.MeshStandardMaterial color={palette.islandTop} roughness={0.9} />
	<Outlines color={OUTLINE} thickness={0.04} />
</T.Mesh>
<T.Mesh position.y={-1.55} rotation.x={Math.PI}>
	<T.ConeGeometry args={[4.0, 2.3, 12, 1]} />
	<T.MeshStandardMaterial color={palette.islandSide} roughness={1} flatShading />
</T.Mesh>
{#each rocks as rock (rock.p.join())}
	<T.Mesh position={[...rock.p]} scale={rock.s}>
		<T.IcosahedronGeometry args={[1, 0]} />
		<T.MeshStandardMaterial color={palette.islandRock} roughness={1} flatShading />
	</T.Mesh>
{/each}

<!-- Rug under the crowd -->
<T.Mesh position={[1.1, 0.015, 0.4]} receiveShadow>
	<T.CylinderGeometry args={[2.1, 2.1, 0.03, 48]} />
	<T.MeshStandardMaterial color={palette.rug} roughness={1} />
</T.Mesh>
<T.Mesh position={[1.1, 0.035, 0.4]} rotation.x={-Math.PI / 2} receiveShadow>
	<T.RingGeometry args={[1.6, 1.75, 48]} />
	<T.MeshStandardMaterial color={palette.lamp} roughness={1} />
</T.Mesh>

<!-- Floor lamp: the warm light in the scene -->
<T.Group position={[2.6, 0, -2.2]}>
	<T.Mesh position.y={0.04} castShadow>
		<T.CylinderGeometry args={[0.35, 0.4, 0.08, 24]} />
		<T.MeshStandardMaterial color={palette.ink} roughness={0.6} />
	</T.Mesh>
	<T.Mesh position.y={1.3}>
		<T.CylinderGeometry args={[0.035, 0.035, 2.5, 8]} />
		<T.MeshStandardMaterial color={palette.ink} roughness={0.6} />
	</T.Mesh>
	<T.Mesh position.y={2.62} castShadow>
		<T.CylinderGeometry args={[0.32, 0.6, 0.55, 24, 1, true]} />
		<T.MeshStandardMaterial
			color={palette.lamp}
			emissive={palette.lampDeep}
			emissiveIntensity={0.6}
			roughness={0.8}
			side={2}
		/>
		<Outlines color={OUTLINE} thickness={0.02} />
	</T.Mesh>
	<T.Mesh position.y={2.45}>
		<T.SphereGeometry args={[0.14, 16, 12]} />
		<T.MeshBasicMaterial color="#fff3d6" />
	</T.Mesh>
	<T.PointLight position.y={2.3} color={palette.lamp} intensity={9} distance={9} decay={1.6} />
</T.Group>

<!-- Potted plant that sways when the fan points at it -->
<T.Group position={[3.4, 0, -1.1]}>
	<T.Mesh position.y={0.28} castShadow>
		<T.CylinderGeometry args={[0.32, 0.24, 0.56, 20]} />
		<T.MeshStandardMaterial color={palette.cream} roughness={0.7} />
		<Outlines color={OUTLINE} thickness={0.025} />
	</T.Mesh>
	<T.Group bind:ref={plant} position.y={0.55}>
		{#each leaves as leaf (leaf.angle)}
			<T.Group rotation.y={leaf.angle}>
				<T.Mesh
					position={[Math.sin(leaf.tilt) * leaf.len * 0.5, leaf.len * 0.5, 0]}
					rotation.z={-leaf.tilt}
					scale={[0.14, leaf.len * 0.5, 0.05]}
					castShadow
				>
					<T.SphereGeometry args={[1, 16, 12]} />
					<T.MeshStandardMaterial color={palette.leaf} roughness={0.7} />
				</T.Mesh>
			</T.Group>
		{/each}
	</T.Group>
</T.Group>

<!-- Floor cushion, for sitting in front of the fan -->
<T.Mesh position={[-0.6, 0.12, 2.3]} scale={[1, 0.45, 1]} castShadow receiveShadow>
	<T.SphereGeometry args={[0.45, 24, 16]} />
	<T.MeshStandardMaterial color={palette.brandLight} roughness={0.9} />
	<Outlines color={OUTLINE} thickness={0.025} />
</T.Mesh>
