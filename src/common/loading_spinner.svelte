<div class="loader" />

<style>
	.loader {
		border: 2vh solid #f3f3f3; /* Light grey */
		border-top: 2vh solid #56949f; /* Blue */
		border-radius: 50%;
		width: 4vh;
		height: 4vh;
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
