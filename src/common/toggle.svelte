<script lang="ts">
	export let checked: boolean;
</script>

<label class="switch">
	<input type="checkbox" bind:checked />
	<span class="slider" />
	<div
		class="checked_icon"
		style={`color: ${checked ? 'var(--onPrimary)' : 'var(--onBackground)'}`}
	>
		YES
	</div>
	<div
		class="disabled_icon"
		style={`color: ${checked ? 'var(--onBackground)' : 'var(--onError)'}`}
	>
		NO
	</div>
</label>

<style>
	.switch {
		height: 100%;
		width: 100%;
		position: relative;
		cursor: pointer;
		display: flex;
		border: 0.3vh solid var(--tertiary);
		flex-direction: row;
		box-sizing: border-box;
		border-radius: 0.5vh;
		overflow: hidden;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
		padding: 0;
		margin: 0;
		border-radius: 0;
	}

	.slider {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 0.5vh;
	}

	.slider:before {
		position: absolute;
		left: 50%;
		content: '';
		height: 100%;
		width: 50%;
		-webkit-transition: 0.3s;
		transition: 0.3s;
		background-color: var(--error);
		padding: 0;
		margin: 0;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(-100%);
		-ms-transform: translateX(-100%);
		transform: translateX(-100%);
		background-color: var(--primary);
	}

	.checked_icon {
		position: absolute;
		top: 25%;
		left: 0%;
		min-width: 50%;
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.disabled_icon {
		position: absolute;
		top: 25%;
		left: 50%;
		min-width: 50%;
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
</style>
