
<section class="ticket" aria-labelledby="fjord-title">
	<div class="art" aria-hidden="true">
		<svg viewBox="0 0 160 180" preserveAspectRatio="xMidYMid slice">
			<rect width="160" height="180" fill="#8fb4d2" />
			<polygon points="0,0 78,0 36,180 0,180" fill="#17253f" />
			<polygon points="160,0 96,0 132,180 160,180" fill="#273c5e" />
			<polygon points="18,0 48,0 28,180 0,180" fill="#1d3a5f" opacity="0.55" />
			<rect y="118" width="160" height="62" fill="#6f9cbe" />
			<path d="M28 132 H132" stroke="#e9f0f4" stroke-width="3" fill="none" opacity="0.7" />
			<path d="M40 148 H120" stroke="#17253f" stroke-width="2" fill="none" opacity="0.35" />
			<path d="M52 162 H108" stroke="#e9f0f4" stroke-width="2" fill="none" opacity="0.55" />
			<!-- hull, mast, sail, a red Hack Club pennant -->
			<polygon points="58,126 112,126 104,142 66,142" fill="#17253f" />
			<rect x="86" y="78" width="3" height="48" fill="#17253f" />
			<polygon points="89,80 89,118 118,118" fill="#f8f3e7" />
			<polygon points="89,68 104,78 89,78" fill="#ec3750" />
		</svg>
	</div>

	<div class="copy">
		<p class="kicker">
			<img src="/hackclub-flag.svg" alt="" width="28" height="16" />
			Fjord It
		</p>
		<h2 id="fjord-title">Come to Norway with us.</h2>
		<p class="pitch">The most magical hackathon ever, on a boat in the middle of a fjord.</p>
		<p class="facts">Bergen, April 2027. 40 teens. Log 100 hours on projects to earn your place.</p>
	</div>

	<div class="stub">
		<p class="when">April 2027</p>
		<a
			class="btn"
			href="https://fjording.hackclub.com"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="RSVP for Fjord It, opens in a new tab">
			RSVP
		</a>
	</div>
</section>

<style>
	.ticket {
		display: grid;
		grid-template-columns: 148px 1fr auto;
		background: var(--white);
		border: 3px solid var(--navy);
		color: var(--ink);
	}

	.art {
		background: var(--sea);
		border-right: 3px solid var(--navy);
		min-height: 148px;
		overflow: hidden;
	}
	.art svg {
		display: block;
		width: 100%;
		height: 100%;
	}

	.copy {
		padding: 1rem 1.15rem 1.05rem;
		min-width: 0;
	}

	.kicker {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin-bottom: 0.35rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--red);
	}
	.kicker img {
		width: 28px;
		height: 16px;
	}

	h2 {
		font-size: clamp(1.35rem, 2.2vw, 1.85rem);
		letter-spacing: -0.03em;
	}

	.pitch {
		margin-top: 0.35rem;
		font-weight: 700;
		color: var(--navy);
		max-width: 42ch;
	}

	.facts {
		margin-top: 0.3rem;
		font-size: 0.92rem;
		color: var(--slate);
		max-width: 46ch;
	}

	.stub {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		gap: 0.55rem;
		padding: 1rem 1.15rem;
		border-left: 3px dashed var(--navy);
		background: var(--paper);
		min-width: 11.5rem;
	}

	.when {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--navy);
	}

	.stub :global(.btn) {
		min-height: 44px;
	}

	@media (max-width: 760px) {
		.ticket {
			grid-template-columns: 1fr;
		}
		.art {
			height: 96px;
			min-height: 0;
			border-right: 0;
			border-bottom: 3px solid var(--navy);
		}
		.stub {
			border-left: 0;
			border-top: 3px dashed var(--navy);
			min-width: 0;
		}
	}
</style>
