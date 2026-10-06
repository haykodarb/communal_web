<!--
	The public landing page, imported from the communal_web site (index.html).
	Copy and layout are unchanged; its colors use the app's theme tokens (the
	same values in light mode), so it also follows the dark theme.
-->
<svelte:head>
	<title>Communal</title>
</svelte:head>

<div class="landing">
	<div id="main-container">
		<div id="header">
			<div id="logo">
				<img id="logo-icon" src="/home/icon-512.png" alt="" />
				<p id="logo-title">Communal</p>
			</div>
		</div>

		<div id="description">
			<div id="description-first-col">
				<h1 id="description-title">Share books with your communities.</h1>
				<h4 id="description-subtitle">
					Connect with your peers and upload your physical collection to contribute to a
					decentralized library, shared among the circles you're connected with.
				</h4>
				<div class="buttons">
					<a href="/auth" id="go-to-app-button">Web app</a>
					<a
						href="https://github.com/haykodarb/communal_app/releases/"
						target="_blank"
						rel="noopener noreferrer"
						id="download-app-button"
					>
						Get APK
					</a>
				</div>
				<div id="description-developers">
					<p class="developers-text">
						Designed by <span class="developers-link">Daiana Veloso</span>
					</p>
					<p class="developers-text">
						Developed by <a
							class="developers-link"
							target="_blank"
							rel="noopener noreferrer"
							href="https://hayk.ar">Hayk Darbinyan</a
						>
					</p>
				</div>
			</div>
			<div id="description-hero">
				<img src="/home/crow.svg" alt="" />
			</div>
		</div>

		<div id="cards-list">
			<div class="card-container">
				<div class="card-row">
					<div class="card-icon"><img src="/home/book.svg" alt="" /></div>
					<div class="card-title">Open your shelf</div>
				</div>
				<div class="card-content">
					Showcase your book collection to your peers. Give each book a new purpose by lending it
					out, building shared stories along the way.
				</div>
			</div>
			<div class="card-container">
				<div class="card-row">
					<div class="card-icon"><img src="/home/exchange.svg" alt="" /></div>
					<div class="card-title">Borrow books</div>
				</div>
				<div class="card-content">
					One of your friends has a book on their shelf that you've been dying to read? Join a
					mutual community and ask if you can loan it out for a bit.
				</div>
			</div>
			<div class="card-container">
				<div class="card-row">
					<div class="card-icon"><img src="/home/messages.svg" alt="" /></div>
					<div class="card-title">Exchange ideas</div>
				</div>
				<div class="card-content">
					Review the books you've read and discuss them with other community members. Share your
					insights and perspectives with like-minded people.
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* The original page used the browser's default box model (the app sets
	   border-box globally), so its 100x30 buttons grow with their padding. */
	.landing,
	.landing * {
		box-sizing: content-box;
	}

	/* The original page centered #main-container in the body. */
	.landing {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: var(--surface);
	}

	#main-container {
		display: flex;
		align-self: stretch;
		margin: 0;
		padding: 20px 5% 60px;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 60px;
		max-width: 72rem;
	}

	#header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
	}

	#logo {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
	}

	#logo-icon {
		height: 50px;
		width: 50px;
	}

	#logo-title {
		/* The browser default the original relied on (app.css resets <p>). */
		margin: 1em 0;
		color: var(--on-surface);
		font-size: 20px;
		font-weight: 600;
	}

	#description {
		display: flex;
		flex-direction: row;
		gap: 30px;
		flex-shrink: 0;
		align-items: flex-start;
		justify-content: center;
		align-self: stretch;
	}

	#description-first-col {
		display: flex;
		flex-direction: column;
		gap: 30px;
		flex: 1;
		color: var(--on-surface);
	}

	#description-title {
		font-size: 30px;
		font-weight: 600;
		margin: 0;
	}

	#description-subtitle {
		font-size: 23px;
		font-weight: 400;
		margin: 0;
	}

	#description-hero {
		flex: 1;
		display: flex;
		flex-direction: row;
		justify-content: end;
		min-height: 500px;
	}

	.buttons {
		display: flex;
		flex-direction: row;
		gap: 10px;
	}

	#description-developers {
		font-style: italic;
		display: flex;
		flex-direction: column;
		gap: 10px;
		justify-content: start;
	}

	.developers-text {
		margin: 0;
		font-weight: 300;
	}

	.developers-link {
		text-decoration: underline;
		color: var(--secondary);
		font-weight: 600;
	}

	#go-to-app-button,
	#download-app-button {
		text-decoration: none;
		display: flex;
		border-radius: 40px;
		padding: 16px 24px;
		justify-content: center;
		align-items: center;
		gap: 10px;
		width: 100px;
		height: 30px;
		font-size: 20px;
		cursor: pointer;
		text-align: center;
	}

	#go-to-app-button {
		background: var(--primary);
		color: var(--on-primary);
		font-weight: 500;
	}

	#download-app-button {
		color: var(--primary);
		border: 2px solid var(--primary);
		background-color: var(--on-primary);
		font-weight: 600;
	}

	#cards-list {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-content: center;
		align-items: center;
		align-self: stretch;
		gap: 30px;
	}

	.card-container {
		display: flex;
		flex: 1;
		padding: 30px;
		flex-direction: column;
		min-width: 200px;
		max-width: 400px;
		align-items: center;
		justify-content: start;
		align-self: stretch;
		gap: 30px;
		border-radius: 40px;
		background: var(--surface-container);
	}

	.card-row {
		display: flex;
		flex-direction: row;
		gap: 15px;
		justify-content: start;
		align-self: stretch;
		align-items: center;
	}

	.card-title {
		color: var(--on-surface);
		font-size: 20px;
		font-weight: 600;
		letter-spacing: 0.1px;
	}

	.card-icon {
		border-radius: 20px;
		background: color-mix(in srgb, var(--secondary) 50%, transparent);
		display: flex;
		width: 60px;
		height: 60px;
		justify-content: center;
		align-items: center;
		gap: 10px;
	}

	.card-content {
		color: var(--on-surface);
		font-size: 16px;
		font-weight: 400;
		letter-spacing: 0.08px;
	}

	@media only screen and (max-width: 900px) {
		#cards-list {
			flex-direction: column;
			justify-content: start;
			align-items: center;
		}

		#description-first-col {
			align-items: center;
			text-align: center;
			max-width: 320px;
		}

		#description-hero {
			display: none;
		}

		.card-container {
			align-self: center;
			height: 200px;
		}
	}
</style>
