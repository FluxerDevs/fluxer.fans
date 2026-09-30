<script lang="ts">
	let { class: className = '', spinning = false }: { class?: string; spinning?: boolean } =
		$props();
</script>

<svg viewBox="0 0 32 32" class={className} aria-hidden="true" focusable="false">
	<circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2.5" />
	<g class:spin={spinning}>
		{#each [0, 120, 240] as angle (angle)}
			<path
				transform="rotate({angle} 16 16)"
				fill="currentColor"
				d="M16 16c-3.6-2.2-4.6-6.9-1.7-9.3 2.4-2 6.3-.8 6.6 2.4.3 2.7-1.6 5.3-4.9 6.9z"
			/>
		{/each}
	</g>
	<circle cx="16" cy="16" r="2.4" fill="var(--mark-hub, #ffc46b)" />
</svg>

<style>
	.spin {
		transform-origin: 16px 16px;
		animation: spin 0.9s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spin {
			animation: none;
		}
	}
</style>
