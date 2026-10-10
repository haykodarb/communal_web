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

	// The timeline draws itself once it scrolls into view.
	let timeline = $state<HTMLElement>();
	let timelineShown = $state(false);
	$effect(() => {
		if (!timeline) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					timelineShown = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.5 }
		);
		observer.observe(timeline);
		return () => observer.disconnect();
	});

	const steps = [
		{ name: 'Request', text: 'Find a book you want to read and ask the owner if you can borrow it.' },
		{ name: 'Accept', text: 'If they say yes, message each other to figure out when and where to meet.' },
		{ name: 'Return', text: "Give it back when you're done, and leave a review if you feel like it." }
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
			text: "Review the books you've read and discuss them with your friends. Share your insights and perspectives with like-minded people."
		}
	];
</script>

<svelte:head>
	<title>Communal</title>
</svelte:head>

<div class="landing">
	<header class="bar">
		<a class="brand" href="/">
			<span class="brand-icon" aria-hidden="true"></span>
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
			<a class="pill" href="/auth/login">{t('Log in')}</a>
			<a class="pill filled" href="/auth/register">{t('Register')}</a>
		</nav>
	</header>

	<main>
		<section class="hero">
			<div class="hero-text">
				<h1>{t('Borrow books from people you know.')}</h1>
				<p class="lead">
					{t(
						"Communal is a shared library made out of your friends' bookshelves. Add the books you own, see what everyone else has, and ask to borrow the ones you want to read."
					)}
				</p>
				<div class="actions">
					<a class="pill large filled" href={auth.session ? '/home' : '/auth'}>
						{t('Open Communal')}
						<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true">
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					</a>
					<a
						class="pill large external"
						href={APK_URL}
						target="_blank"
						rel="noopener noreferrer"
					>
						{t('Get the Android app')}
						<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true">
							<path d="M7 17 17 7M8 7h9v9" />
						</svg>
					</a>
				</div>
			</div>
			<span class="crow" aria-hidden="true"></span>
		</section>

		<section class="reach" aria-labelledby="reach-title">
			<div class="reach-text">
				<h2 id="reach-title">{t("Who's in your community")}</h2>
				<p class="lead">
					{t("The people you've added as friends, and the people they've added. That's a lot of bookshelves, and there's always someone you both know.")}
				</p>
				<dl class="legend">
					<div>
						<dt><span class="dot you"></span>{t('You')}</dt>
						<dd>{t("The books you've added.")}</dd>
					</div>
					<div>
						<dt><span class="dot friend"></span>{t('Friends')}</dt>
						<dd>{t("People you've added, and their books.")}</dd>
					</div>
					<div>
						<dt><span class="dot fof"></span>{t('Friends of friends')}</dt>
						<dd>
							{t("Your friends' friends. You can see their books, and they can see yours.")}
						</dd>
					</div>
				</dl>
				<p class="boundary-note">
					{t(
						"Nobody past that can see your shelf. If you'd rather only your friends see it, there's a setting for that."
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
			<h2 id="how-title">{t('How borrowing works')}</h2>
			<!-- The loan page's own timeline: requested, accepted, returned. -->
			<ol class="timeline" class:shown={timelineShown} bind:this={timeline}>
				<span class="track" aria-hidden="true"></span>
				{#each steps as step, i (step.name)}
					<li style:--step={i}>
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
	/* The app icon's bird, as a mask so it takes the brand text's colour. */
	.brand-icon {
		width: 40px;
		height: 40px;
		flex: 0 0 auto;
		background: currentColor;
		-webkit-mask: url('/assets/icon-512.png') center / contain no-repeat;
		mask: url('/assets/icon-512.png') center / contain no-repeat;
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
		/* Rounds the state layer every button gets. */
		border-radius: 8px;
	}

	/* Pills: the app's button shapes as links (outlined, or filled for the
	   main action). On hover they lift with a soft primary shadow and the big
	   ones' arrows nudge the way they go; pressing pushes them back down. */
	.pill {
		gap: 8px;
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
		-webkit-tap-highlight-color: transparent;
		transition:
			transform 200ms var(--ease-standard),
			box-shadow 200ms var(--ease-standard);
	}
	.arrow {
		width: 20px;
		height: 20px;
		margin-right: -4px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: transform 200ms var(--ease-standard);
	}
	/* The shadow always shows; only the movement waits on reduced motion. */
	@media (hover: hover) {
		.pill:hover {
			box-shadow: 0 10px 20px -8px color-mix(in srgb, var(--primary) 70%, transparent);
		}
	}
	.pill:active {
		box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--primary) 50%, transparent);
		transition-duration: 80ms;
	}
	@media (prefers-reduced-motion: no-preference) {
		@media (hover: hover) {
			.pill:hover {
				transform: translateY(-2px);
			}
			.pill:hover .arrow {
				transform: translateX(4px);
			}
			.pill.external:hover .arrow {
				transform: translate(3px, -3px);
			}
		}
		.pill:active {
			transform: translateY(0) scale(0.97);
		}
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
	/* The same crow mask as Logo, filled with the theme's gradient. */
	.crow {
		display: block;
		width: 100%;
		aspect-ratio: 713 / 1024;
		max-height: 460px;
		background: linear-gradient(90deg, var(--primary) 25%, var(--tertiary));
		-webkit-mask: url('../lib/assets/crow.png') center / contain no-repeat;
		mask: url('../lib/assets/crow.png') center / contain no-repeat;
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
	.how h2 {
		text-align: center;
	}
	/* Like the loan page's timeline: three steps on a line, each one's text
	   centered under its dot. The dots sit in the middle of three equal
	   columns, and the list bleeds into the page margin (up to 10% a side, never
	   past the window) so the line between the outer dots stays about 80% of
	   the content width while the outer texts get room on both sides. */
	.timeline {
		--bleed: min(10%, (100vw - 100%) / 2 - 16px);
		list-style: none;
		width: calc(100% + 2 * var(--bleed));
		margin: 0 0 0 calc(-1 * var(--bleed));
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		position: relative;
	}
	.track {
		position: absolute;
		top: 11px;
		/* From the first column's center to the last one's. */
		left: calc(100% / 6);
		right: calc(100% / 6);
		height: 4px;
		border-radius: 2px;
		background: var(--on-surface);
		transform-origin: left center;
	}
	.timeline li {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 0 16px;
		text-align: center;
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
		max-width: 22em;
		line-height: 1.55;
		color: var(--on-surface-variant);
	}

	/* The line draws across and each step appears as it reaches it. Without
	   motion (or before it scrolls in, for no-JS), everything just shows. */
	@media (prefers-reduced-motion: no-preference) {
		.timeline:not(.shown) .track {
			transform: scaleX(0);
		}
		.timeline:not(.shown) .marker {
			transform: scale(0);
		}
		.timeline:not(.shown) h3,
		.timeline:not(.shown) p {
			opacity: 0;
			translate: 0 8px;
		}
		.timeline.shown .track {
			transition: transform 1100ms cubic-bezier(0.65, 0, 0.35, 1);
		}
		.timeline.shown .marker {
			transition: transform 450ms cubic-bezier(0.34, 1.5, 0.64, 1);
			transition-delay: calc(var(--step) * 500ms);
		}
		.timeline.shown h3,
		.timeline.shown p {
			transition:
				opacity 450ms ease,
				translate 450ms ease;
			transition-delay: calc(var(--step) * 500ms + 120ms);
		}
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

	/* ---- Footer ----------------------------------------------------------- */
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
	/* Footer links show their underline on hover. */
	.footer-links a,
	a.credit {
		text-decoration-color: transparent;
		transition: text-decoration-color 150ms ease;
	}
	@media (hover: hover) {
		.footer-links a:hover,
		a.credit:hover {
			text-decoration-color: currentColor;
		}
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
		/* The timeline runs downwards on phones. Each step draws the line down to
		   the next marker, so it ends at the last one (not under its text). */
		.track {
			display: none;
		}
		.timeline li:not(:last-of-type)::before {
			content: '';
			position: absolute;
			top: 13px;
			left: 11px;
			width: 4px;
			height: calc(100% + 32px);
			background: var(--on-surface);
			transform-origin: center top;
		}
		@media (prefers-reduced-motion: no-preference) {
			.timeline:not(.shown) li::before {
				transform: scaleY(0);
			}
			.timeline.shown li::before {
				transition: transform 500ms cubic-bezier(0.65, 0, 0.35, 1);
				transition-delay: calc(var(--step) * 500ms + 100ms);
			}
		}
		.timeline {
			width: auto;
			margin: 0;
			gap: 32px;
		}
		.timeline li {
			align-items: flex-start;
			text-align: left;
			padding: 0 0 0 48px;
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
