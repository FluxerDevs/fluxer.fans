<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { HTML, Outlines, RoundedBoxGeometry } from '@threlte/extras';
	import { Group, Vector3 } from 'three';
	import { getFanClub, type Cheer } from '$lib/fan-club.svelte';
	import { getWind } from './wind';
	import { OUTLINE, palette } from './palette';

	let { cheer }: { cheer: Cheer } = $props();

	const club = getFanClub();
	const wind = getWind();

	const LIFE = 9;
	const seed = Math.random() * 10;
	// Starts just in front of the blades, heading wherever the fan points right now.
	const pos = wind.origin.clone().add(new Vector3(0, 0.1, 0));
	const vel = wind.dir
		.clone()
		.multiplyScalar(0.8 + wind.power * 2.6)
		.add(new Vector3(0, 0.45, 0));

	let group = $state<Group>();
	let label = $state<HTMLElement>();
	let age = 0;

	useTask(
		(delta) => {
			if (!group) return;
			age += delta;
			// Keep drifting with the current wind, plus a lazy upward float.
			vel.addScaledVector(wind.dir, wind.power * 0.6 * delta);
			vel.y += 0.05 * delta;
			pos.addScaledVector(vel, delta);
			group.position.set(pos.x, pos.y + Math.sin(age * 2 + seed) * 0.12, pos.z);
			group.rotation.z = Math.sin(age * 1.6 + seed) * 0.18;
			const grow = Math.min(1, age * 3);
			group.scale.setScalar(grow * (0.8 + 0.2 * Math.sin(age * 3)));
			if (label) label.style.opacity = String(Math.min(1, (LIFE - age) / 1.5, age * 3));
			if (age > LIFE) club.dropCheer(cheer.id);
		},
		{ running: () => club.visible }
	);
</script>

<T.Group bind:ref={group} position={pos.toArray()}>
	<T.Mesh castShadow>
		<RoundedBoxGeometry args={[0.9, 0.55, 0.22]} radius={0.1} />
		<T.MeshStandardMaterial color={palette.cream} roughness={0.5} />
		<Outlines color={OUTLINE} thickness={0.025} />
	</T.Mesh>
	<T.Mesh position={[-0.28, -0.3, 0]} rotation.z={2.6}>
		<T.ConeGeometry args={[0.1, 0.2, 10]} />
		<T.MeshStandardMaterial color={palette.cream} roughness={0.5} />
	</T.Mesh>
	<!-- Typing dots, because it's a chat bubble -->
	{#each [-0.2, 0, 0.2] as x (x)}
		<T.Mesh position={[x, 0, 0.12]}>
			<T.SphereGeometry args={[0.055, 12, 10]} />
			<T.MeshBasicMaterial color={palette.brand} />
		</T.Mesh>
	{/each}
	<HTML position={[0, 0.62, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
		<p bind:this={label} class="cheer" aria-hidden="true">{cheer.text}</p>
	</HTML>
</T.Group>

<style>
	.cheer {
		max-width: 14rem;
		width: max-content;
		padding: 0.4rem 0.75rem;
		border-radius: 0.9rem 0.9rem 0.9rem 0.25rem;
		background: #4641d9;
		color: #fff;
		font-weight: 600;
		font-size: 0.875rem;
		line-height: 1.3;
		overflow-wrap: anywhere;
		text-align: left;
		box-shadow: 0 2px 0 #15122f;
	}
</style>
