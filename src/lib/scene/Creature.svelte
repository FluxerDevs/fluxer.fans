<script lang="ts" module>
	export type Held = 'finger' | 'pennant' | 'handfan' | 'scarf' | 'beanie';
</script>

<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { HTML, Outlines, RoundedBoxGeometry, useCursor } from '@threlte/extras';
	import { DoubleSide, Group, Shape, Vector3 } from 'three';
	import { getFanClub } from '$lib/fan-club.svelte';
	import { damp, exposureAt, getWind } from './wind';
	import { OUTLINE, palette } from './palette';

	type Props = {
		position: [number, number, number];
		/** Which way the creature faces, radians. */
		facing?: number;
		color: string;
		held: Held;
		scale?: number;
		/** Light enough to get lifted off the ground on full speed. */
		floaty?: boolean;
		shouts: string[];
		seed: number;
		oncheer?: (at: Vector3) => void;
	};

	let {
		position,
		facing = 0,
		color,
		held,
		scale = 1,
		floaty = false,
		shouts,
		seed,
		oncheer
	}: Props = $props();

	const club = getFanClub();
	const wind = getWind();
	const { onPointerEnter, onPointerLeave } = useCursor();

	let lean = $state<Group>();
	let body = $state<Group>();
	let eyes = $state<Group>();
	let arm = $state<Group>();
	let flap = $state<Group>();
	let tuft = $state<Group>();

	let shout = $state<string | null>(null);
	let shoutTimer = 0;
	let jump = 1;
	let lift = 0;

	const world = new Vector3();
	let lastCrowdCheer = club.crowdCheer;

	function cheer(pick = Math.floor(Math.random() * shouts.length)) {
		shout = shouts[pick % shouts.length];
		shoutTimer = 2.2;
		jump = 0;
		body?.getWorldPosition(world);
		oncheer?.(world.clone().setY(world.y + 0.6 * scale));
	}

	// The "make the crowd cheer" button bumps a counter; each creature starts with a little delay.
	$effect(() => {
		if (club.crowdCheer === lastCrowdCheer) return;
		lastCrowdCheer = club.crowdCheer;
		// Offset by seed so everyone shouts something different.
		const pick = seed + club.crowdCheer * 3;
		const t = setTimeout(() => cheer(pick), seed * 90);
		return () => clearTimeout(t);
	});

	const pennant = new Shape();
	pennant.moveTo(0, 0);
	pennant.lineTo(0.5, -0.12);
	pennant.lineTo(0, -0.26);
	pennant.closePath();

	useTask(
		(delta) => {
			if (!lean || !body) return;
			const t = wind.time + seed * 1.7;
			lean.getWorldPosition(world);
			const gust = exposureAt(wind, world);

			// Lean into the wind: tilt the top of the body towards where the air is going.
			const tilt = gust * 0.38 + Math.sin(t * 18) * 0.03 * gust;
			lean.rotation.z = damp(lean.rotation.z, -wind.dir.x * tilt, 6, delta);
			lean.rotation.x = damp(lean.rotation.x, wind.dir.z * tilt, 6, delta);

			// Jump arc when cheering, idle bob otherwise.
			jump = Math.min(1, jump + delta * 1.8);
			const hop = Math.sin(jump * Math.PI) * 0.55;
			lift = damp(lift, floaty && gust > 0.45 ? 0.55 + Math.sin(t * 5) * 0.1 : 0, 2.5, delta);
			body.position.y = Math.abs(Math.sin(t * 2.2)) * 0.035 + hop + lift;
			body.rotation.y = jump < 1 ? jump * Math.PI * 2 : 0;

			if (eyes) eyes.scale.y = damp(eyes.scale.y, gust > 0.5 ? 0.3 : 1, 10, delta);
			if (arm) {
				const pump = jump < 1 ? Math.sin(jump * Math.PI * 4) * 0.5 : 0;
				arm.rotation.z = -0.25 + pump + Math.sin(t * 3) * 0.05;
			}
			if (flap) {
				if (held === 'handfan') {
					// Fans itself harder when the big fan is off. It's hot.
					const heat = 1 - wind.power;
					flap.rotation.y = Math.sin(t * (6 + heat * 10)) * (0.2 + heat * 0.5);
				} else {
					const wobble = Math.sin(t * (6 + gust * 26)) * (0.08 + gust * 0.45);
					flap.rotation.y = wobble;
					flap.rotation.z = damp(flap.rotation.z, gust * 0.9, 5, delta);
				}
			}
			if (tuft) tuft.rotation.z = damp(tuft.rotation.z, -0.2 - gust * 1.1, 8, delta);

			if (shout) {
				shoutTimer -= delta;
				if (shoutTimer <= 0) shout = null;
			}
		},
		{ running: () => club.visible }
	);
</script>

<T.Group {position} {scale}>
	<T.Group bind:ref={lean}>
		<T.Group rotation.y={facing}>
			<T.Group
				bind:ref={body}
				onclick={(e: { stopPropagation: () => void }) => {
					e.stopPropagation();
					cheer();
				}}
				onpointerenter={onPointerEnter}
				onpointerleave={onPointerLeave}
			>
				<!-- Chat-bubble body -->
				<T.Mesh position.y={0.52} castShadow>
					<RoundedBoxGeometry args={[0.74, 0.8, 0.56]} radius={0.25} smoothness={5} />
					<T.MeshStandardMaterial {color} roughness={0.55} />
					<Outlines color={OUTLINE} thickness={0.03} />
				</T.Mesh>
				<!-- Bubble tail -->
				<T.Mesh position={[-0.25, 0.14, 0.06]} rotation.z={2.5} castShadow>
					<T.ConeGeometry args={[0.1, 0.24, 12]} />
					<T.MeshStandardMaterial {color} roughness={0.55} />
				</T.Mesh>

				<!-- Legs -->
				<T.Mesh position={[-0.13, 0.07, 0]}>
					<T.CapsuleGeometry args={[0.055, 0.1, 4, 8]} />
					<T.MeshStandardMaterial color={OUTLINE} />
				</T.Mesh>
				<T.Mesh position={[0.13, 0.07, 0]}>
					<T.CapsuleGeometry args={[0.055, 0.1, 4, 8]} />
					<T.MeshStandardMaterial color={OUTLINE} />
				</T.Mesh>

				<!-- Face -->
				<T.Group bind:ref={eyes} position={[0, 0.6, 0.28]}>
					{#each [-0.13, 0.13] as x (x)}
						<T.Mesh position.x={x}>
							<T.SphereGeometry args={[0.066, 16, 12]} />
							<T.MeshBasicMaterial color={OUTLINE} />
						</T.Mesh>
						<T.Mesh position={[x + 0.022, 0.026, 0.055]}>
							<T.SphereGeometry args={[0.02, 8, 6]} />
							<T.MeshBasicMaterial color="#ffffff" />
						</T.Mesh>
					{/each}
				</T.Group>
				<T.Mesh position={[0, 0.49, 0.282]} rotation.z={Math.PI}>
					<T.TorusGeometry args={[0.05, 0.013, 8, 16, Math.PI]} />
					<T.MeshBasicMaterial color={OUTLINE} />
				</T.Mesh>
				{#each [-0.23, 0.23] as x (x)}
					<T.Mesh position={[x, 0.5, 0.281]}>
						<T.CircleGeometry args={[0.05, 16]} />
						<T.MeshBasicMaterial color={palette.blush} />
					</T.Mesh>
				{/each}

				<!-- Hair tuft that bends in the wind -->
				<T.Group bind:ref={tuft} position={[0, 0.92, 0]}>
					<T.Mesh position.y={0.06} rotation.z={0.3}>
						<T.TorusGeometry args={[0.07, 0.02, 6, 12, Math.PI * 1.3]} />
						<T.MeshStandardMaterial {color} roughness={0.55} />
					</T.Mesh>
				</T.Group>

				{#if held === 'finger'}
					<!-- Foam finger, the universal symbol of being a fan -->
					<T.Group bind:ref={arm} position={[0.36, 0.5, 0.05]}>
						<T.Mesh position={[0.08, 0.14, 0]} rotation.z={-0.3}>
							<T.CapsuleGeometry args={[0.04, 0.16, 4, 8]} />
							<T.MeshStandardMaterial {color} roughness={0.55} />
						</T.Mesh>
						<T.Group position={[0.16, 0.36, 0]}>
							<T.Mesh castShadow>
								<RoundedBoxGeometry args={[0.24, 0.24, 0.12]} radius={0.05} />
								<T.MeshStandardMaterial color={palette.lamp} roughness={0.7} />
								<Outlines color={OUTLINE} thickness={0.02} />
							</T.Mesh>
							<T.Mesh position={[0.04, 0.22, 0]} castShadow>
								<T.CapsuleGeometry args={[0.05, 0.2, 4, 10]} />
								<T.MeshStandardMaterial color={palette.lamp} roughness={0.7} />
								<Outlines color={OUTLINE} thickness={0.02} />
							</T.Mesh>
						</T.Group>
					</T.Group>
				{:else if held === 'pennant'}
					<T.Group bind:ref={arm} position={[0.36, 0.45, 0.05]}>
						<T.Mesh position.y={0.4}>
							<T.CylinderGeometry args={[0.015, 0.015, 0.9, 6]} />
							<T.MeshStandardMaterial color={palette.cream} />
						</T.Mesh>
						<T.Group bind:ref={flap} position.y={0.82}>
							<T.Mesh castShadow>
								<T.ShapeGeometry args={[pennant]} />
								<T.MeshStandardMaterial color={palette.lamp} side={DoubleSide} roughness={0.7} />
							</T.Mesh>
						</T.Group>
					</T.Group>
				{:else if held === 'handfan'}
					<!-- A fan holding a fan -->
					<T.Group bind:ref={arm} position={[0.36, 0.55, 0.12]}>
						<T.Group bind:ref={flap} position={[0.05, 0.12, 0]}>
							<T.Mesh position.y={0.02}>
								<T.CircleGeometry args={[0.28, 14, 0, Math.PI]} />
								<T.MeshStandardMaterial
									color={palette.brandLight}
									side={DoubleSide}
									roughness={0.7}
								/>
							</T.Mesh>
							<T.Mesh position.y={-0.06}>
								<T.CylinderGeometry args={[0.012, 0.012, 0.16, 6]} />
								<T.MeshStandardMaterial color={palette.cream} />
							</T.Mesh>
						</T.Group>
					</T.Group>
				{:else if held === 'scarf'}
					<T.Mesh position.y={0.2} scale={[1, 0.6, 0.8]}>
						<T.TorusGeometry args={[0.34, 0.07, 10, 24]} />
						<T.MeshStandardMaterial color={palette.lamp} roughness={0.8} />
					</T.Mesh>
					<T.Group bind:ref={flap} position={[-0.3, 0.2, 0.12]}>
						<T.Mesh position.x={-0.16} castShadow>
							<RoundedBoxGeometry args={[0.34, 0.1, 0.03]} radius={0.012} />
							<T.MeshStandardMaterial color={palette.lamp} roughness={0.8} />
						</T.Mesh>
					</T.Group>
				{:else if held === 'beanie'}
					<T.Group position.y={0.86}>
						<T.Mesh scale={[1, 0.7, 0.85]}>
							<T.SphereGeometry args={[0.3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
							<T.MeshStandardMaterial color={palette.lamp} roughness={0.9} />
						</T.Mesh>
						<T.Mesh position.y={0.25}>
							<T.SphereGeometry args={[0.07, 12, 10]} />
							<T.MeshStandardMaterial color={palette.cream} roughness={0.9} />
						</T.Mesh>
					</T.Group>
				{/if}

				{#if shout}
					<HTML
						position={[0, 1.3 + (seed % 2) * 0.35, 0]}
						center
						pointerEvents="none"
						zIndexRange={[20, 0]}
					>
						<p class="shout" aria-hidden="true">{shout}</p>
					</HTML>
				{/if}
			</T.Group>
		</T.Group>
	</T.Group>
</T.Group>

<style>
	.shout {
		white-space: nowrap;
		padding: 0.35rem 0.7rem;
		border-radius: 0.9rem 0.9rem 0.9rem 0.25rem;
		background: #fff;
		color: #15122f;
		font-weight: 700;
		font-size: 0.875rem;
		line-height: 1.2;
		box-shadow: 0 2px 0 #15122f;
		animation: pop 180ms ease-out;
	}

	@keyframes pop {
		from {
			transform: scale(0.6);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.shout {
			animation: none;
		}
	}
</style>
