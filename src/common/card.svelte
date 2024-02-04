<div class="card_container">
	<slot />
</div>

<style>
	.card_container {
		width: 100%;
		height: 100%;
		border-radius: 1vh;
		transition: 0.3s;
		overflow: hidden;
		cursor: pointer;
		background-color: rgba(var(--tertiary-rgb), 0.025);
		box-shadow: 0 0.25vh 0.5vh 0 rgba(var(--tertiary-rgb), 0.25);
	}

	.card_container:hover {
		box-shadow: 0 0.5vh 1vh 0 rgba(var(--tertiary-rgb), 0.25);
	}
</style>
