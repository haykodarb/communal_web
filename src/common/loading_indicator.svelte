<script lang='ts'>
    export let height: string;
    export let width: string;
    export let border_radius: string;
</script>

<div class="loading_indicator" style="height: {height}; width: {width}; border-radius: {border_radius}"/>

<style>
	.loading_indicator {
		background: linear-gradient(110deg, #deedea 10%, #fff 30%, #deedea 50%);
		border-radius: 5px;
		background-size: 200% 100%;
		animation: 0.75s shine linear infinite;
	}

	@keyframes shine {
		to {
			background-position-x: -200%;
		}
	}
</style>
