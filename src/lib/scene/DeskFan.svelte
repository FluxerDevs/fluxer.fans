<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Outlines, RoundedBoxGeometry, useCursor } from '@threlte/extras';
	import { DoubleSide, Group, MeshBasicMaterial, Vector3 } from 'three';
	import { getFanClub, SPEEDS } from '$lib/fan-club.svelte';
	import { damp, getWind } from './wind';
	import { OUTLINE, palette } from './palette';

	type Props = { position?: [number, number, number]; yaw?: number };
	let { position = [0, 0, 0], yaw = 0.9 }: Props = $props();

	const club = getFanClub();
	const wind = getWind();
	const { onPointerEnter, onPointerLeave } = useCursor();

	let head = $state<Group>();
	let rotor = $state<Group>();
	let blur = $state<MeshBasicMaterial>();
	let eyes = $state<Group>();

	// Face on the grille badge, which stays still while the blades spin behind it.
	const mood = $derived(club.speed === 0 ? 'sleepy' : club.speed === 3 ? 'thrilled' : 'happy');

	const forward = new Vector3();
	let sweep = 0;
	let blink = 0;

	useTask(
		(delta) => {
			const target = club.speed / 3;
			wind.power = damp(wind.power, target, club.speed > wind.power * 3 ? 1.6 : 0.9, delta);
			wind.time += delta;

			if (rotor) rotor.rotation.z -= delta * (0.4 + wind.power * 26) * Math.min(1, wind.power * 8);

			if (head) {
				// Oscillate like a real desk fan, only while it is running.
				sweep += delta * 0.55 * Math.min(1, wind.power * 4);
				head.rotation.y = Math.sin(sweep) * 0.45;
				head.rotation.x = -0.1 + Math.sin(wind.time * 30) * 0.004 * wind.power;
				head.updateWorldMatrix(true, false);
				wind.origin.set(0, 0, 0.6).applyMatrix4(head.matrixWorld);
				forward.set(0, 0, 1).transformDirection(head.matrixWorld);
				wind.dir.copy(forward);
			}

			if (blur) blur.opacity = wind.power * 0.45;

			if (eyes) {
				blink -= delta;
				if (blink < -0.12) blink = 2 + Math.random() * 3;
				const open = mood === 'sleepy' ? 0.15 : blink < 0 ? 0.1 : 1;
				eyes.scale.y = damp(eyes.scale.y, open, 18, delta);
			}
		},
		{ running: () => club.visible }
	);

	const spokes = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);
	const ribs = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
	const blades = [0, 1, 2, 3].map((i) => (i / 4) * Math.PI * 2);
	const keyX = (i: number) => -0.33 + i * 0.22;
</script>

<T.Group {position} rotation.y={yaw}>
	<!-- Base -->
	<T.Mesh position.y={0.16} castShadow receiveShadow>
		<T.CylinderGeometry args={[0.72, 0.86, 0.32, 40]} />
		<T.MeshStandardMaterial color={palette.cream} roughness={0.55} />
		<Outlines color={OUTLINE} thickness={0.025} />
	</T.Mesh>

	<!-- Speed keys on the base, in sync with the speed buttons on the page -->
	{#each SPEEDS as s (s)}
		{@const pressed = club.speed === s}
		<T.Mesh
			position={[keyX(s), pressed ? 0.31 : 0.36, 0.52]}
			rotation.x={-0.35}
			castShadow
			onclick={(e: { stopPropagation: () => void }) => {
				e.stopPropagation();
				club.setSpeed(s);
			}}
			onpointerenter={onPointerEnter}
			onpointerleave={onPointerLeave}
		>
			<RoundedBoxGeometry args={[0.18, 0.12, 0.2]} radius={0.04} />
			<T.MeshStandardMaterial
				color={pressed ? palette.lamp : s === 0 ? palette.brandLight : palette.brand}
				emissive={pressed ? palette.lampDeep : '#000000'}
				emissiveIntensity={pressed ? 0.5 : 0}
				roughness={0.5}
			/>
			<Outlines color={OUTLINE} thickness={0.015} />
		</T.Mesh>
	{/each}

	<!-- Stem and neck -->
	<T.Mesh position.y={1.05} castShadow>
		<T.CylinderGeometry args={[0.09, 0.12, 1.5, 20]} />
		<T.MeshStandardMaterial color={palette.cream} roughness={0.5} />
		<Outlines color={OUTLINE} thickness={0.02} />
	</T.Mesh>
	<T.Mesh position.y={1.85} castShadow>
		<T.SphereGeometry args={[0.17, 20, 16]} />
		<T.MeshStandardMaterial color={palette.brand} roughness={0.4} />
	</T.Mesh>

	<!-- Head: oscillates, holds the motor, rotor, cage and the face badge -->
	<T.Group bind:ref={head} position.y={2.12}>
		<T.Mesh position.z={-0.42} scale={[1, 1, 1.25]} castShadow>
			<T.SphereGeometry args={[0.4, 28, 20]} />
			<T.MeshStandardMaterial color={palette.cream} roughness={0.5} />
			<Outlines color={OUTLINE} thickness={0.025} />
		</T.Mesh>
		<T.Mesh position.z={-0.9}>
			<T.CylinderGeometry args={[0.12, 0.16, 0.14, 16]} />
			<T.MeshStandardMaterial color={palette.brand} roughness={0.4} />
		</T.Mesh>

		<T.Group bind:ref={rotor} position.z={0.02}>
			{#each blades as angle (angle)}
				<T.Group rotation.z={angle}>
					<T.Mesh position.y={0.5} rotation.y={0.4} scale={[0.36, 0.5, 0.05]} castShadow>
						<T.SphereGeometry args={[1, 24, 16]} />
						<T.MeshStandardMaterial color={palette.brand} roughness={0.35} />
					</T.Mesh>
				</T.Group>
			{/each}
			<T.Mesh rotation.x={Math.PI / 2}>
				<T.CylinderGeometry args={[0.16, 0.16, 0.16, 20]} />
				<T.MeshStandardMaterial color={palette.brandHover} roughness={0.4} />
			</T.Mesh>
		</T.Group>

		<!-- Motion blur disc that fades in with speed -->
		<T.Mesh position.z={0.06}>
			<T.CircleGeometry args={[1, 48]} />
			<T.MeshBasicMaterial
				bind:ref={blur}
				color={palette.brandLight}
				transparent
				opacity={0}
				depthWrite={false}
				side={DoubleSide}
			/>
		</T.Mesh>

		<!-- Cage -->
		<T.Mesh position.z={-0.14}>
			<T.TorusGeometry args={[1.08, 0.035, 10, 64]} />
			<T.MeshStandardMaterial color={palette.cream} roughness={0.4} />
		</T.Mesh>
		<T.Mesh position.z={0.26}>
			<T.TorusGeometry args={[1.08, 0.04, 10, 64]} />
			<T.MeshStandardMaterial color={palette.cream} roughness={0.4} />
			<Outlines color={OUTLINE} thickness={0.015} />
		</T.Mesh>
		{#each ribs as angle (angle)}
			<T.Mesh
				position={[Math.cos(angle) * 1.08, Math.sin(angle) * 1.08, 0.06]}
				rotation.x={Math.PI / 2}
			>
				<T.CylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
				<T.MeshStandardMaterial color={palette.cream} roughness={0.4} />
			</T.Mesh>
		{/each}
		{#each spokes as angle (angle)}
			<T.Group rotation.z={angle} position.z={0.3}>
				<T.Mesh position.y={0.66}>
					<T.CylinderGeometry args={[0.014, 0.014, 0.84, 5]} />
					<T.MeshStandardMaterial color={palette.cream} roughness={0.4} />
				</T.Mesh>
			</T.Group>
		{/each}

		<!-- Badge with a face -->
		<T.Group position.z={0.34}>
			<T.Mesh rotation.x={Math.PI / 2}>
				<T.CylinderGeometry args={[0.3, 0.3, 0.06, 40]} />
				<T.MeshStandardMaterial color={palette.cream} roughness={0.5} />
				<Outlines color={OUTLINE} thickness={0.02} />
			</T.Mesh>
			<T.Group bind:ref={eyes} position={[0, 0.05, 0.035]}>
				<T.Mesh position.x={-0.09}>
					<T.SphereGeometry args={[0.042, 16, 12]} />
					<T.MeshBasicMaterial color={OUTLINE} />
				</T.Mesh>
				<T.Mesh position.x={0.09}>
					<T.SphereGeometry args={[0.042, 16, 12]} />
					<T.MeshBasicMaterial color={OUTLINE} />
				</T.Mesh>
			</T.Group>
			{#if mood === 'thrilled'}
				<T.Mesh position={[0, -0.08, 0.035]} scale={[1, 1.2, 0.4]}>
					<T.SphereGeometry args={[0.05, 16, 12]} />
					<T.MeshBasicMaterial color={OUTLINE} />
				</T.Mesh>
			{:else}
				<T.Mesh position={[0, -0.05, 0.035]} rotation.z={Math.PI}>
					<T.TorusGeometry args={[0.065, 0.014, 8, 20, Math.PI]} />
					<T.MeshBasicMaterial color={OUTLINE} />
				</T.Mesh>
			{/if}
			<T.Mesh position={[-0.17, -0.04, 0.032]}>
				<T.CircleGeometry args={[0.04, 16]} />
				<T.MeshBasicMaterial color={palette.blush} />
			</T.Mesh>
			<T.Mesh position={[0.17, -0.04, 0.032]}>
				<T.CircleGeometry args={[0.04, 16]} />
				<T.MeshBasicMaterial color={palette.blush} />
			</T.Mesh>
		</T.Group>
	</T.Group>
</T.Group>
