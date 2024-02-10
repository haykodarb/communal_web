<div class="loader" />

<style>
	.loader {
		border: 1vh solid var(--surface); 
		border-top: 1vh solid var(--primary); 
		border-bottom: 1vh solid var(--primary); 
		border-radius: 50%;
		width: 3vh;
		height: 3vh;
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}
</style>
