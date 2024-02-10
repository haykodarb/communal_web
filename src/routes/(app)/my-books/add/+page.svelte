<script lang="ts">
	import type { BookForm } from '$lib/tables/books';
	import Toggle from '../../../../common/toggle.svelte';
	import LoadingSpinner from '../../../../common/loading_spinner.svelte';

	let form: BookForm = {
		title: '',
		author: '',
		available: true,
		read: false,
		review: null
	};

	let input: HTMLInputElement;
	let image: string;

	$: () => {
		if (input.files == null || input.files.length == 0) {
			return;
		}

		const file = input.files[0];

		if (file) {
			const reader = new FileReader();

			if (reader.result == null) return;

			reader.readAsDataURL(file);

			reader.onload = (e) => {
				if (e.target == null) return;

				image = e.target.result as string;
			};
		}
	}

	let errors = { title: '', author: '', review: '' };

	let add_review = false;
	let loading = false;

	$: {
		if (!add_review) {
			form.review = null;
		}
	}

	const onSubmit = () => {
		loading = true;

		setTimeout(() => {
			loading = false;
		}, 1000);
	};
</script>

<div class="container">
	<div id="image_container">
		{#if image != undefined || image != null}
			<img id="cover" src={image} alt="d" />
		{/if}
		<button on:click={() => {input.click()}} id="select_button">Select Image</button>
		<input bind:this={input} style="display: none;" type="file" placeholder="Select" />
	</div>

	<input bind:value={form.title} class="input_field" placeholder="Title" type="text" alt="Title" />

	<input
		bind:value={form.author}
		class="input_field"
		placeholder="Author"
		type="text"
		alt="Author"
	/>
	<div class="check_row">
		<div class="check_title">Allow Loans</div>
		<div class="toggle">
			<Toggle bind:checked={form.available} />
		</div>
	</div>

	<div class="check_row">
		<div class="check_title">Already Read</div>
		<div class="toggle">
			<Toggle bind:checked={form.read} />
		</div>
	</div>

	{#if form.read}
		<div class="check_row">
			<div class="check_title">Add Review</div>
			<div class="toggle">
				<Toggle bind:checked={add_review} />
			</div>
		</div>
	{/if}

	{#if add_review}
		<textarea class="review_field" placeholder="Review" bind:value={form.review} />
	{/if}

	<div class="button_container">
		{#if loading}
			<LoadingSpinner />
		{:else}
			<button class="elevated_button" id="submit" on:click={onSubmit}> Add </button>
		{/if}
	</div>
</div>

<style>
	.container {
		width: 30%;
		height: 100%;
		box-sizing: border-box;
		padding: 2%;
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		gap: 3%;
	}

	#image_container {
		height: 40vh;
		aspect-ratio: 3/4;
		position: relative;
	}

	#cover {
		height: 100%;
		width: 100%;
	}

	#select_button {
		position: absolute;
		height: 20%;
		width: 100%;
		top: 80%;
		background-color: rgba(var(--surface-rgb), 0.5);
	}

	.input_field {
		height: 5vh;
		width: 90%;
	}

	.review_field {
		height: 20vh;
		width: 90%;
	}

	.check_row {
		width: 90%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: end;
		box-sizing: border-box;
		padding: 0;
		margin: 0;
	}

	.check_title {
		font-size: 2vh;
	}

	.toggle {
		height: 5vh;
		width: 50%;
	}

	.button_container {
		height: 5vh;
		width: 75%;
		margin-top: 2vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	#submit {
		height: 100%;
		width: 100%;
		border-radius: 0.5vh;
	}
</style>
