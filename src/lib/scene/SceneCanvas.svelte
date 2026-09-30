<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { NoToneMapping, PCFShadowMap } from 'three';
	import Scene from './Scene.svelte';

	let { shouts }: { shouts: string[] } = $props();
</script>

<!-- Loaded lazily from Hero so three.js stays out of the first paint. -->
<Canvas dpr={[1, 1.75]} shadows={PCFShadowMap} toneMapping={NoToneMapping}>
	<Scene {shouts} />
</Canvas>
