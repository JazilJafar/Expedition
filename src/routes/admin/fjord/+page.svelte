<script lang="ts">
	import '$lib/styles/app.css';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const when = (iso: string) =>
		new Date(iso).toLocaleString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'UTC'
		}) + ' UTC';
</script>

<svelte:head><title>Fjord It RSVPs · Expedition</title></svelte:head>

<main class="app-page">
	<div class="wrap">
		<div class="app-head">
			<div>
				<h1 class="app-title">Fjord It</h1>
				<p class="hint lead">RSVPs from signed-in Expedition accounts. One row per person.</p>
			</div>
			<div class="head-actions">
				<a class="btn btn-outline" href="/admin/fjord/export">Export CSV</a>
				<a class="btn btn-outline" href="/admin">Admin</a>
			</div>
		</div>

		{#if !data.ready}
			<p class="error-box">
				The Fjord It table isn’t there yet. Apply <code>supabase/migrations/0049_fjord_rsvps.sql</code> to the Expedition database, then restart PostgREST.
				It only adds a table.
			</p>
			{#if data.message}<p class="hint">{data.message}</p>{/if}
		{:else}
			<section class="totals">
				<div><span class="n">{data.count}</span><span class="k">{data.count === 1 ? 'RSVP' : 'RSVPs'}</span></div>
			</section>

			{#if data.rsvps.length === 0}
				<p class="empty">No RSVPs yet.</p>
			{:else}
				<ul class="people">
					{#each data.rsvps as row (row.user_id)}
						<li>
							<div class="who">
								<strong>{row.name}</strong>
								<span class="meta">{row.email}</span>
								<span class="meta">{when(row.created_at)}</span>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</div>
</main>

<style>
	.lead {
		margin-top: 0.35rem;
		max-width: 46ch;
	}
	.head-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
	}
	.totals {
		display: inline-flex;
		margin: 0 0 1.2rem;
		padding: 1rem 1.2rem;
		background: var(--white);
		border: 3px solid var(--navy);
	}
	.totals div {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.n {
		font-size: 1.8rem;
		font-weight: 800;
		color: var(--navy);
		line-height: 1;
	}
	.k {
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.people {
		list-style: none;
		margin: 0;
		padding: 0;
		background: var(--white);
		border: 3px solid var(--navy);
	}
	.people li {
		padding: 0.85rem 1rem;
		border-bottom: 1px solid var(--rule);
	}
	.people li:last-child {
		border-bottom: 0;
	}
	.who {
		display: flex;
		flex-direction: column;
		gap: 0.12rem;
	}
	.who strong {
		color: var(--navy);
	}
	.meta {
		font-size: 0.88rem;
		color: var(--muted);
	}
	.empty {
		color: var(--muted);
	}
	code {
		font-family: var(--font-mono);
		font-size: 0.85em;
	}
</style>
