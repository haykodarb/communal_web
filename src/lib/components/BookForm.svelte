<script lang="ts">
	import Button from './Button.svelte';
	import ImagePicker from './ImagePicker.svelte';
	import Switch from './Switch.svelte';
	import TextField from './TextField.svelte';
	import Icon from './Icon.svelte';
	import type { BookForm } from '#lib/data/api.ts';
	import type { Book } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	// Shared by the create and edit pages (BookCreatePage / BookEditPage).
	let {
		book = null,
		submitLabel,
		onsubmit
	}: {
		/** The book being edited; null when creating. */
		book?: Book | null;
		submitLabel: string;
		onsubmit: (form: BookForm, cover: Blob | null) => Promise<void>;
	} = $props();

	// svelte-ignore state_referenced_locally -- the form is seeded once.
	let title = $state(book?.title ?? '');
	// svelte-ignore state_referenced_locally
	let author = $state(book?.author ?? '');
	// svelte-ignore state_referenced_locally
	let review = $state(book?.review ?? '');
	// svelte-ignore state_referenced_locally
	let isPublic = $state(book?.public ?? false);
	let cover = $state<Blob | null>(null);

	let submitted = $state(false);
	let loading = $state(false);
	let error = $state('');

	function validate(value: string, length: number, optional: boolean): string {
		if (!value) return optional ? '' : t('Please enter something');
		if (value.length < length) return t('form-min-length').replace('{n}', String(length));
		return '';
	}

	const titleError = $derived(submitted ? validate(title, 3, false) : '');
	const authorError = $derived(submitted ? validate(author, 3, false) : '');
	const reviewError = $derived(submitted ? validate(review, 3, true) : '');

	async function submit() {
		submitted = true;
		error = '';
		if (titleError || authorError || reviewError) return;
		if (!book && !cover) {
			error = t('Please add a book cover image.');
			return;
		}

		loading = true;
		try {
			await onsubmit({ title, author, review: review || null, public: isPublic }, cover);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			loading = false;
		}
	}
</script>

<form
	class="form"
	novalidate
	onsubmit={(event) => {
		event.preventDefault();
		submit();
	}}
>
	<ImagePicker
		bind:image={cover}
		aspect={3 / 4}
		maxWidth={540}
		bucket="book_covers"
		path={book?.image_path}
	/>

	<div class="fields">
		<TextField label={t('Title')} bind:value={title} maxlength={50} error={titleError} onsubmit={submit} />
		<TextField label={t('Author')} bind:value={author} maxlength={50} error={authorError} onsubmit={submit} />
		<TextField label={t('Review (Optional)')} bind:value={review} rows={3} error={reviewError} />
	</div>

	<div class="row">
		<span>{t('Publicly visible?')}</span>
		<Switch value={isPublic} onchange={() => (isPublic = !isPublic)} ariaLabel={t('Publicly visible?')}>
			{#snippet left()}<Icon name="check" size={20} />{/snippet}
			{#snippet right()}<Icon name="x" size={20} />{/snippet}
		</Switch>
	</div>

	{#if error}
		<p class="error-text">{error}</p>
	{/if}

	<Button type="submit" {loading}>{t(submitLabel)}</Button>
</form>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.fields {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 16px;
	}
	.error-text {
		text-align: center;
		font-size: 14px;
		color: var(--error);
	}
</style>
