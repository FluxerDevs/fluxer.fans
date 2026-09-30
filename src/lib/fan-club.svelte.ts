import { getContext, setContext } from 'svelte';

export type Speed = 0 | 1 | 2 | 3;

export const SPEEDS: Speed[] = [0, 1, 2, 3];

export type Cheer = {
	id: number;
	text: string;
};

const MAX_CHEERS = 6;
const KEY = Symbol('fan-club');

/** Shared state between the HTML controls and the 3D scene. */
export class FanClub {
	speed = $state<Speed>(1);
	cheers = $state<Cheer[]>([]);
	/** Bumped every time the whole crowd should cheer at once. */
	crowdCheer = $state(0);
	/** False while the hero is scrolled out of view, so the scene can stop rendering. */
	visible = $state(true);
	reducedMotion = $state(false);

	#nextId = 1;

	setSpeed = (speed: Speed) => {
		this.speed = speed;
	};

	sendCheer = (text: string) => {
		const cheer = { id: this.#nextId++, text };
		this.cheers = [...this.cheers, cheer].slice(-MAX_CHEERS);
		return cheer;
	};

	dropCheer = (id: number) => {
		this.cheers = this.cheers.filter((c) => c.id !== id);
	};

	cheerAll = () => {
		this.crowdCheer++;
	};
}

export function setFanClub(club: FanClub) {
	return setContext(KEY, club);
}

export function getFanClub(): FanClub {
	return getContext(KEY);
}
