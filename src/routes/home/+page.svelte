<script lang="ts">
	import { auth } from '#lib/auth.svelte.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';

	// The public landing page, from the communal_web site and in its words.
	// "Community" is the language; underneath, a community is your friends and
	// their friends (the diagram explains that). Its one visual statement is the diagram of how
	// far your library reaches; everything else stays in the app's own style.

	const APK_URL = 'https://github.com/haykodarb/communal_app/releases/';

	// Diagram geometry (viewBox 400 x 400): you in the middle, five friends on
	// the first ring, their friends on the second, and the boundary beyond it.
	const C = 200;
	const R1 = 92;
	const R2 = 158;
	const polar = (r: number, deg: number) => ({
		x: C + r * Math.cos((deg * Math.PI) / 180),
		y: C + r * Math.sin((deg * Math.PI) / 180)
	});
	const friends = [-90, -18, 54, 126, 198].map((deg) => ({ deg, ...polar(R1, deg) }));
	// Each friend's own friends, fanned out around them on the outer ring.
	const outer = friends.flatMap((f, i) =>
		(i % 2 === 0 ? [-20, 20] : [-24, 0, 24]).map((d) => ({
			from: f,
			...polar(R2, f.deg + d)
		}))
	);

	const steps = [
		{ name: 'Request', text: "Find a book you've been dying to read and ask its owner to loan it out." },
		{ name: 'Accept', text: 'Once they agree, arrange the handover through messages.' },
		{ name: 'Return', text: "Bring it back when you're done and share what you thought of it." }
	];

	// The original site's three cards, with its own icons.
	const cards = [
		{
			icon: '/assets/book.svg',
			title: 'Open your shelf',
			text: 'Showcase your book collection to your peers. Give each book a new purpose by lending it out, building shared stories along the way.'
		},
		{
			icon: '/assets/exchange.svg',
			title: 'Borrow books',
			text: "One of your friends has a book on their shelf that you've been dying to read? It's already in your community: ask if you can loan it out for a bit."
		},
		{
			icon: '/assets/messages.svg',
			title: 'Exchange ideas',
			text: "Review the books you've read and discuss them with other community members. Share your insights and perspectives with like-minded people."
		}
	];
</script>

<svelte:head>
	<title>Communal</title>
	<meta
		name="description"
		content="Share books with your communities. Upload your physical collection to a decentralized library, shared among the circles you're connected with."
	/>
</svelte:head>

<div class="landing">
	<header class="bar">
		<a class="brand" href="/home">
			<img src="/assets/icon-512.png" alt="" width="40" height="40" />
			<span>Communal</span>
		</a>
		<nav class="account">
			<button
				class="lang"
				type="button"
				aria-label={t('Change language')}
				onclick={() => i18n.toggle()}
			>
				{i18n.locale === 'en' ? 'ES' : 'EN'}
			</button>
			{#if auth.session}
				<a class="pill filled" href="/app">{t('Open Communal')}</a>
			{:else}
				<a class="pill" href="/app/auth/login">{t('Log in')}</a>
				<a class="pill filled" href="/app/auth/register">{t('Register')}</a>
			{/if}
		</nav>
	</header>

	<main>
		<section class="hero">
			<div class="hero-text">
				<h1>{t('Share books with your communities.')}</h1>
				<p class="lead">
					{t(
						"Connect with your peers and upload your physical collection to contribute to a decentralized library, shared among the circles you're connected with."
					)}
				</p>
				<div class="actions">
					{#if auth.session}
						<a class="pill large filled" href="/app">{t('Open Communal')}</a>
					{:else}
						<a class="pill large filled" href="/app/auth/register">{t('Create an account')}</a>
					{/if}
					<a class="pill large" href={APK_URL} target="_blank" rel="noopener noreferrer">
						{t('Get the Android app')}
					</a>
				</div>
			</div>
			<img class="crow" src="/assets/crow.svg" alt="" />
		</section>

		<section class="reach" aria-labelledby="reach-title">
			<div class="reach-text">
				<h2 id="reach-title">{t('Your community grows with your friends')}</h2>
				<p class="lead">
					{t("Your community is made of your friends and the people they know. Every book in it is one or two introductions away.")}
				</p>
				<dl class="legend">
					<div>
						<dt><span class="dot you"></span>{t('You')}</dt>
						<dd>{t('Your shelf, open to your community.')}</dd>
					</div>
					<div>
						<dt><span class="dot friend"></span>{t('Friends')}</dt>
						<dd>{t("The people you add, and their collections.")}</dd>
					</div>
					<div>
						<dt><span class="dot fof"></span>{t('Friends of friends')}</dt>
						<dd>
							{t("Your friends' friends are part of your community too.")}
						</dd>
					</div>
				</dl>
				<p class="boundary-note">
					{t(
						'Your community stops there, so it stays close to you. You can also keep your shelf among direct friends.'
					)}
				</p>
			</div>

			<svg
				class="network"
				viewBox="0 0 400 400"
				role="img"
				aria-label={t('You, your friends around you, and their friends around them.')}
			>
				<circle class="boundary" cx={C} cy={C} r="190" />
				<circle class="ring" cx={C} cy={C} r={R2} />
				<circle class="ring" cx={C} cy={C} r={R1} />
				{#each outer as node, i (i)}
					<line class="edge" x1={node.from.x} y1={node.from.y} x2={node.x} y2={node.y} />
				{/each}
				{#each friends as node, i (i)}
					<line class="edge" x1={C} y1={C} x2={node.x} y2={node.y} />
				{/each}
				{#each outer as node, i (i)}
					<circle class="node fof" cx={node.x} cy={node.y} r="11" style:--i={i} />
				{/each}
				{#each friends as node, i (i)}
					<circle class="node friend" cx={node.x} cy={node.y} r="17" style:--i={i} />
				{/each}
				<circle class="node you" cx={C} cy={C} r="26" />
			</svg>
		</section>

		<section class="how" aria-labelledby="how-title">
			<h2 id="how-title">{t('From shelf to shelf')}</h2>
			<!-- The loan page's own timeline: requested, accepted, returned. -->
			<ol class="timeline">
				{#each steps as step (step.name)}
					<li>
						<span class="marker"></span>
						<h3>{t(step.name)}</h3>
						<p>{t(step.text)}</p>
					</li>
				{/each}
			</ol>
		</section>

		<section class="features">
			<div class="cards">
				{#each cards as card (card.title)}
					<article class="card">
						<span class="card-icon"><img src={card.icon} alt="" /></span>
						<h3>{t(card.title)}</h3>
						<p>{t(card.text)}</p>
					</article>
				{/each}
			</div>
		</section>

		<section class="closing">
			<h2>{t('Give your books a new purpose.')}</h2>
			{#if auth.session}
				<a class="pill large filled" href="/app">{t('Open Communal')}</a>
			{:else}
				<a class="pill large filled" href="/app/auth/register">{t('Create an account')}</a>
			{/if}
		</section>
	</main>

	<footer>
		<p>
			{t('Designed by')} <span class="credit">Daiana Veloso</span>
		</p>
		<p>
			{t('Developed by')}
			<a class="credit" href="https://hayk.ar" target="_blank" rel="noopener noreferrer"
				>Hayk Darbinyan</a
			>
		</p>
		<nav class="footer-links">
			<a href="/privacy">{t('Privacy policy')}</a>
			<a href={APK_URL} target="_blank" rel="noopener noreferrer">{t('Get the Android app')}</a>
		</nav>
	</footer>
</div>

<style>
	.landing {
		--page: min(72rem, 100% - 2 * clamp(20px, 5vw, 48px));
		min-height: 100vh;
		background: var(--surface);
		color: var(--on-surface);
	}

	/* ---- Header -------------------------------------------------------- */
	.bar {
		width: var(--page);
		margin: 0 auto;
		padding: 20px 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--on-surface);
		text-decoration: none;
		font-size: 20px;
		font-weight: 600;
	}
	.account {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.lang {
		border: none;
		background: none;
		padding: 8px;
		color: var(--on-surface-variant);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}

	/* Pills: the app's button shapes as links (outlined, or filled for the
	   main action). */
	.pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		padding: 0 20px;
		border: 2px solid var(--primary);
		border-radius: 999px;
		color: var(--primary);
		font-size: 15px;
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
	}
	.pill.filled {
		background: var(--primary);
		color: var(--on-primary);
	}
	.pill.large {
		height: 56px;
		padding: 0 28px;
		font-size: 17px;
	}
	.pill:focus-visible,
	.lang:focus-visible,
	.brand:focus-visible,
	footer a:focus-visible {
		outline: 2px solid var(--secondary);
		outline-offset: 3px;
	}

	main {
		width: var(--page);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: clamp(80px, 12vw, 140px);
	}

	h1 {
		font-size: clamp(2.25rem, 5.2vw, 3.6rem);
		font-weight: 700;
		line-height: 1.08;
		letter-spacing: -0.02em;
	}
	h2 {
		font-size: clamp(1.75rem, 3.4vw, 2.4rem);
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.01em;
	}
	h3 {
		font-size: 1.15rem;
		font-weight: 600;
	}
	.lead {
		max-width: 34em;
		font-size: clamp(1.05rem, 1.6vw, 1.25rem);
		line-height: 1.6;
		color: var(--on-surface-variant);
	}

	/* ---- Hero ---------------------------------------------------------- */
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		align-items: center;
		gap: 40px;
		padding-top: clamp(24px, 6vw, 72px);
	}
	.hero-text {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 8px;
	}
	.crow {
		width: 100%;
		max-height: 460px;
		object-fit: contain;
	}

	/* ---- Reach (the network diagram) ------------------------------------ */
	.reach {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: center;
		gap: clamp(32px, 6vw, 80px);
		padding: clamp(28px, 5vw, 56px);
		border-radius: 40px;
		background: var(--surface-container);
	}
	.reach-text {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.legend {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.legend dt {
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: 600;
	}
	.legend dd {
		margin: 4px 0 0 24px;
		line-height: 1.5;
		color: var(--on-surface-variant);
	}
	.dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		flex: 0 0 auto;
	}
	.dot.you {
		background: var(--primary);
	}
	.dot.friend {
		background: var(--secondary);
	}
	.dot.fof {
		background: var(--tertiary);
	}
	.boundary-note {
		padding-top: 16px;
		border-top: 1px dashed var(--outline);
		line-height: 1.5;
		color: var(--on-surface-variant);
	}

	.network {
		width: 100%;
		max-width: 440px;
		justify-self: center;
		overflow: visible;
	}
	.ring {
		fill: none;
		stroke: var(--outline);
		stroke-width: 1.5;
	}
	.boundary {
		fill: none;
		stroke: var(--on-surface-variant);
		stroke-width: 1.5;
		stroke-dasharray: 4 7;
		opacity: 0.6;
	}
	.edge {
		stroke: var(--on-surface-variant);
		stroke-width: 1.5;
		opacity: 0.35;
	}
	.node {
		stroke: var(--surface-container);
		stroke-width: 4;
	}
	.node.you {
		fill: var(--primary);
	}
	.node.friend {
		fill: var(--secondary);
	}
	.node.fof {
		fill: var(--tertiary);
	}

	/* The page's one moment of motion: the network grows outwards from you. */
	@media (prefers-reduced-motion: no-preference) {
		.node {
			transform-box: fill-box;
			transform-origin: center;
			animation: appear 500ms cubic-bezier(0.34, 1.4, 0.64, 1) both;
		}
		.node.friend {
			animation-delay: calc(250ms + var(--i) * 70ms);
		}
		.node.fof {
			animation-delay: calc(700ms + var(--i) * 40ms);
		}
		.edge,
		.ring {
			animation: fade 600ms ease 200ms both;
		}
		.boundary {
			animation: fade 600ms ease 1300ms both;
		}
	}
	@keyframes appear {
		from {
			transform: scale(0);
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	/* ---- How borrowing works -------------------------------------------- */
	.how {
		display: flex;
		flex-direction: column;
		gap: 40px;
	}
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 32px;
		position: relative;
	}
	/* The line between the markers, as on the loan page: each step draws it
	   to the next one, so it ends at the last marker. */
	.timeline li:not(:last-child)::before {
		content: '';
		position: absolute;
		top: 11px;
		left: 13px;
		width: calc(100% + 32px);
		height: 4px;
		background: var(--on-surface);
	}
	.timeline li {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.marker {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: var(--on-surface);
		position: relative;
		z-index: 1;
		margin-bottom: 8px;
	}
	.marker::after {
		content: '';
		position: absolute;
		inset: 8px;
		border-radius: 50%;
		background: var(--surface);
	}
	.timeline p {
		max-width: 26em;
		line-height: 1.55;
		color: var(--on-surface-variant);
	}

	/* ---- Features -------------------------------------------------------- */
	.features {
		display: flex;
		flex-direction: column;
		gap: 40px;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 24px;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 30px;
		border-radius: 40px;
		background: var(--surface-container);
	}
	.card-icon {
		width: 60px;
		height: 60px;
		margin-bottom: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 20px;
		background: color-mix(in srgb, var(--secondary) 50%, transparent);
		color: var(--surface-container);
	}
	.card p {
		line-height: 1.55;
		color: var(--on-surface-variant);
	}

	/* ---- Closing + footer ----------------------------------------------- */
	.closing {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 28px;
		text-align: center;
	}
	footer {
		width: var(--page);
		margin: clamp(80px, 12vw, 140px) auto 0;
		padding: 32px 0 48px;
		border-top: 1px solid var(--outline);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 32px;
		font-size: 14px;
		color: var(--on-surface-variant);
	}
	.credit {
		color: var(--secondary);
		font-weight: 600;
	}
	.footer-links {
		margin-left: auto;
		display: flex;
		gap: 24px;
	}
	.footer-links a {
		color: var(--on-surface-variant);
	}

	/* ---- Small screens ------------------------------------------------- */
	@media (max-width: 860px) {
		.hero,
		.reach {
			grid-template-columns: minmax(0, 1fr);
		}
		.crow {
			display: none;
		}
		.network {
			max-width: 340px;
			grid-row: 1;
		}
		.timeline,
		.cards {
			grid-template-columns: minmax(0, 1fr);
		}
		/* The timeline runs downwards on phones. */
		.timeline li:not(:last-child)::before {
			top: 13px;
			left: 11px;
			width: 4px;
			height: calc(100% + 32px);
		}
		.timeline li {
			padding-left: 48px;
		}
		.marker {
			position: absolute;
			left: 0;
			top: 0;
		}
		.footer-links {
			margin-left: 0;
		}
	}
	@media (max-width: 480px) {
		.bar .pill {
			height: 36px;
			padding: 0 14px;
			font-size: 14px;
		}
		.brand span {
			display: none;
		}
	}
</style>
