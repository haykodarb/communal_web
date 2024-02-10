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
	let showImage: boolean = false;

	const onChanged = () => {
		console.log(input);

		if (input.files == null || input.files.length == 0) {
			return;
		}

		const file = input.files[0];
		console.log(file);

		if (file) {
			showImage = false;

			const reader = new FileReader();

			console.log('gets here');

			reader.readAsDataURL(file);

			console.log(reader);

			reader.onload = (e) => {
				if (e.target == null) return;

				image = e.target.result as string;

				showImage = true;
			};
		}
	};

	let errors = { title: '', author: '', review: '' };

	let add_review = false;
	let loading = false;

	$: {
		if (!form.read) {
			add_review = false;
		}

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
	<div class="left_container">
		<div id="image_container">
			<button
				on:click={() => {
					input.click();
				}}
				id="select_button">Select Image</button
			>
			{#if showImage}
				<img id="cover" src={image} alt="d" />
			{/if}
			<input
				bind:this={input}
				style="display: none;"
				on:change={onChanged}
				type="file"
				placeholder="Select"
			/>
		</div>

		<input
			bind:value={form.title}
			class="input_field"
			placeholder="Title"
			type="text"
			alt="Title"
		/>

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
			<textarea class="review_field" placeholder="Review" bind:value={form.review} rows="5" />
		{/if}

		<div class="button_container">
			{#if loading}
				<LoadingSpinner />
			{:else}
				<button class="elevated_button" id="submit" on:click={onSubmit}> Add </button>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.left_container {
		width: 40%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		gap: 3%;
		box-sizing: bord;
		padding: 5%;
		overflow: scroll;
	}

	#image_container {
		min-height: 40vh;
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
		background-color: rgba(var(--surface-rgb), 0.95);
		color: var(--onSurface);
		cursor: pointer;
		font-size: 2vh;
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
		min-width: 90%;
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
		height: 5vh;
		width: 100%;
		border-radius: 0.5vh;
	}
</style>
