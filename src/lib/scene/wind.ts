import { getContext, setContext } from 'svelte';
import { Vector3 } from 'three';

/**
 * Per-frame wind values. Mutated inside `useTask` callbacks and read by every
 * windy thing in the scene, so it is a plain object instead of reactive state.
 */
export type Wind = {
	/** 0..1, eased towards the selected fan speed. */
	power: number;
	/** World-space point just in front of the blades. */
	origin: Vector3;
	/** World-space direction the fan head is pointing. */
	dir: Vector3;
	/** Seconds since the scene started. */
	time: number;
};

const KEY = Symbol('wind');

const scratch = new Vector3();

export function createWind(): Wind {
	return { power: 0, origin: new Vector3(), dir: new Vector3(1, 0, 0), time: 0 };
}

export function setWind(wind: Wind) {
	return setContext(KEY, wind);
}

export function getWind(): Wind {
	return getContext(KEY);
}

/**
 * How hard the wind hits a point: full power straight ahead of the fan,
 * fading off to the sides. The fan oscillates, so this sweeps across the crowd.
 */
export function exposureAt(wind: Wind, point: Vector3) {
	scratch.copy(point).sub(wind.origin);
	scratch.y *= 0.4;
	const dist = scratch.length();
	if (dist < 0.0001) return wind.power;
	const facing = Math.max(0, scratch.divideScalar(dist).dot(wind.dir));
	const falloff = 1 / (1 + dist * 0.12);
	return wind.power * facing ** 3 * falloff;
}

export const damp = (current: number, target: number, lambda: number, delta: number) =>
	current + (target - current) * (1 - Math.exp(-lambda * delta));
