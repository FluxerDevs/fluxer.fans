<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import {
		CapsuleGeometry,
		Color,
		InstancedMesh,
		MeshBasicMaterial,
		MeshStandardMaterial,
		Object3D,
		PlaneGeometry,
		Quaternion,
		DoubleSide,
		Vector3
	} from 'three';
	import { getFanClub } from '$lib/fan-club.svelte';
	import { getWind } from './wind';
	import { palette } from './palette';

	type Props = {
		/** Island center in world space, so confetti can land on it. */
		islandX?: number;
		islandRadius?: number;
	};
	let { islandX = 0, islandRadius = 4 }: Props = $props();

	const club = getFanClub();
	const wind = getWind();

	// Wind streaks: thin capsules that shoot out of the fan and curl as they go.
	const STREAKS = 48;
	const streakMesh = new InstancedMesh(
		new CapsuleGeometry(0.016, 0.55, 2, 6),
		new MeshBasicMaterial({
			color: '#ffffff',
			transparent: true,
			opacity: 0.55,
			depthWrite: false
		}),
		STREAKS
	);
	streakMesh.frustumCulled = false;

	type Particle = { pos: Vector3; vel: Vector3; age: number; life: number; spin: Vector3 };
	const streaks: Particle[] = Array.from({ length: STREAKS }, () => ({
		pos: new Vector3(),
		vel: new Vector3(),
		age: 1,
		life: 1,
		spin: new Vector3()
	}));

	// Confetti: thrown by cheering fans, carried off by the breeze.
	const CONFETTI = 90;
	const confettiMesh = new InstancedMesh(
		new PlaneGeometry(0.09, 0.055),
		new MeshStandardMaterial({ side: DoubleSide, roughness: 0.6 }),
		CONFETTI
	);
	confettiMesh.frustumCulled = false;
	const confettiColors = [palette.lamp, palette.brandLight, palette.cream, palette.blush].map(
		(c) => new Color(c)
	);
	const confetti: (Particle & { rot: Vector3 })[] = Array.from({ length: CONFETTI }, (_, i) => {
		confettiMesh.setColorAt(i, confettiColors[i % confettiColors.length]);
		return {
			pos: new Vector3(),
			vel: new Vector3(),
			age: 1,
			life: 1,
			spin: new Vector3(),
			rot: new Vector3()
		};
	});

	const dummy = new Object3D();
	const up = new Vector3(0, 1, 0);
	const tmp = new Vector3();
	const side = new Vector3();
	const quat = new Quaternion();
	let spawnDebt = 0;
	let nextStreak = 0;
	let nextConfetti = 0;

	function hide(mesh: InstancedMesh, i: number) {
		dummy.position.set(0, -999, 0);
		dummy.scale.setScalar(0);
		dummy.updateMatrix();
		mesh.setMatrixAt(i, dummy.matrix);
	}
	for (let i = 0; i < STREAKS; i++) hide(streakMesh, i);
	for (let i = 0; i < CONFETTI; i++) hide(confettiMesh, i);

	function spawnStreak() {
		const p = streaks[nextStreak];
		nextStreak = (nextStreak + 1) % STREAKS;
		// Random point on the blade disc, perpendicular to the wind.
		side.crossVectors(wind.dir, up).normalize();
		tmp.crossVectors(side, wind.dir).normalize();
		const a = Math.random() * Math.PI * 2;
		const r = Math.sqrt(Math.random()) * 0.9;
		p.pos
			.copy(wind.origin)
			.addScaledVector(side, Math.cos(a) * r)
			.addScaledVector(tmp, Math.sin(a) * r);
		p.vel.copy(wind.dir).multiplyScalar(3.5 + wind.power * 6 + Math.random() * 1.5);
		// Sideways swirl so the streaks curl instead of flying in straight lines.
		p.spin
			.copy(side)
			.multiplyScalar(Math.cos(a + Math.PI / 2))
			.addScaledVector(tmp, Math.sin(a + Math.PI / 2))
			.multiplyScalar(1.4 + wind.power * 1.6);
		p.age = 0;
		p.life = 0.9 + Math.random() * 0.6;
	}

	/** Throw a small handful of confetti from a point, e.g. above a cheering fan. */
	export function burst(at: Vector3, count = 14) {
		for (let n = 0; n < count; n++) {
			const p = confetti[nextConfetti];
			nextConfetti = (nextConfetti + 1) % CONFETTI;
			p.pos.copy(at);
			p.vel.set(
				(Math.random() - 0.5) * 1.6,
				2.2 + Math.random() * 1.6,
				(Math.random() - 0.5) * 1.6
			);
			p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
			p.spin.set(
				(Math.random() - 0.5) * 10,
				(Math.random() - 0.5) * 10,
				(Math.random() - 0.5) * 10
			);
			p.age = 0;
			p.life = 3 + Math.random() * 1.5;
		}
	}

	useTask(
		(delta) => {
			const dt = Math.min(delta, 1 / 20);

			spawnDebt += dt * wind.power * 70;
			while (spawnDebt >= 1 && wind.power > 0.03) {
				spawnStreak();
				spawnDebt -= 1;
			}
			if (wind.power <= 0.03) spawnDebt = 0;

			for (let i = 0; i < STREAKS; i++) {
				const p = streaks[i];
				if (p.age >= p.life) {
					hide(streakMesh, i);
					continue;
				}
				p.age += dt;
				p.pos.addScaledVector(p.vel, dt).addScaledVector(p.spin, dt * Math.sin(p.age * 6));
				const k = p.age / p.life;
				const s = Math.sin(Math.min(1, k) * Math.PI);
				dummy.position.copy(p.pos);
				tmp.copy(p.vel).normalize();
				quat.setFromUnitVectors(up, tmp);
				dummy.quaternion.copy(quat);
				dummy.scale.set(s, 0.4 + s * (0.6 + wind.power), s);
				dummy.updateMatrix();
				streakMesh.setMatrixAt(i, dummy.matrix);
			}
			streakMesh.instanceMatrix.needsUpdate = true;

			for (let i = 0; i < CONFETTI; i++) {
				const p = confetti[i];
				if (p.age >= p.life) {
					hide(confettiMesh, i);
					continue;
				}
				p.age += dt;
				// Gravity, air drag, and a push from the fan if it's pointing this way.
				tmp.copy(p.pos).sub(wind.origin);
				const facing = Math.max(0, tmp.normalize().dot(wind.dir));
				p.vel.y -= 2.6 * dt;
				p.vel.multiplyScalar(1 - 1.6 * dt);
				p.vel.addScaledVector(wind.dir, facing ** 2 * wind.power * 14 * dt);
				p.vel.y += Math.sin(p.age * 7 + i) * 0.6 * dt;
				p.pos.addScaledVector(p.vel, dt);
				if (p.pos.y < 0.03 && Math.hypot(p.pos.x - islandX, p.pos.z) < islandRadius) {
					p.pos.y = 0.03;
					p.vel.set(p.vel.x * 0.5, 0, p.vel.z * 0.5);
				} else {
					p.rot.addScaledVector(p.spin, dt);
				}
				const fade = Math.min(1, (p.life - p.age) * 2);
				dummy.position.copy(p.pos);
				dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z);
				dummy.scale.setScalar(fade);
				dummy.updateMatrix();
				confettiMesh.setMatrixAt(i, dummy.matrix);
			}
			confettiMesh.instanceMatrix.needsUpdate = true;
		},
		{ running: () => club.visible }
	);
</script>

<T is={streakMesh} />
<T is={confettiMesh} castShadow />
