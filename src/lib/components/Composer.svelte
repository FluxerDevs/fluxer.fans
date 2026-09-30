<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getFanClub } from '$lib/fan-club.svelte';

	const MAX = 80;
	const club = getFanClub();

	let text = $state('');
	let status = $state<{ kind: 'error' | 'sent'; message: string } | null>(null);

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		const cheer = text.trim();
		if (!cheer) {
			status = { kind: 'error', message: m.composer_empty() };
			return;
		}
		club.sendCheer(cheer.slice(0, MAX));
		text = '';
		status = {
			kind: 'sent',
			message: club.speed === 0 ? m.composer_sent_calm() : m.composer_sent()
		};
	}
</script>

<form {onsubmit} novalidate class="w-full">
	<label for="cheer" class="mb-2 block text-sm font-semibold text-white/75">
		{m.composer_label()}
	</label>
	<!-- Styled after a chat message box, since that's what Fluxer is. -->
	<div
		class="flex items-center gap-2 rounded-control bg-night-600 p-1.5 ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-brand-light"
	>
		<span class="ps-2 text-lg font-bold text-brand-light select-none" aria-hidden="true">#</span>
		<input
			id="cheer"
			type="text"
			bind:value={text}
			maxlength={MAX}
			autocomplete="off"
			placeholder={m.composer_placeholder()}
			aria-describedby="cheer-note cheer-status"
			aria-invalid={status?.kind === 'error'}
			oninput={() => status?.kind === 'error' && (status = null)}
			class="min-h-11 min-w-0 flex-1 border-0 bg-transparent px-1 text-base text-white placeholder:text-white/60 focus:ring-0 focus:outline-none"
		/>
		<button
			type="submit"
			class="min-h-11 shrink-0 rounded-[0.6rem] bg-brand px-4 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
		>
			{m.composer_send()}
		</button>
	</div>
	<p id="cheer-note" class="mt-2 text-sm text-white/70">{m.composer_note()}</p>
	<p
		id="cheer-status"
		aria-live="polite"
		class="mt-1 min-h-5 text-sm font-semibold {status?.kind === 'error'
			? 'text-lamp'
			: 'text-brand-light'}"
	>
		{status?.message ?? ''}
	</p>
</form>
