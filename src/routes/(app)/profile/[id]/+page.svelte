<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import PillButton from '#lib/components/PillButton.svelte';
	import ProfileView from '#lib/components/ProfileView.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import {
		deleteFriendship,
		getBooksForUser,
		getFriendshipWith,
		getProfile,
		getReviewsForUser,
		sendFriendRequest
	} from '#lib/data/api.ts';
	import type { Book, Friendship, Loan, Profile } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	// Another user's profile (ProfileOtherPage), with friendship and message buttons.
	let profile = $state<Profile | null>(null);
	let friendship = $state<Friendship | null>(null);
	let books = $state<Book[]>([]);
	let reviews = $state<Loan[]>([]);
	let loading = $state(true);
	let busy = $state(false);
	let error = $state('');

	let confirmDialog: ConfirmDialog;
	let confirmTitle = $state('');

	const id = $derived(page.params.id!);
	const userId = $derived(auth.user!.id);

	$effect(() => {
		if (id === userId) {
			goto('/my-profile', { replaceState: true });
			return;
		}
		loading = true;
		Promise.all([
			getProfile(id),
			getFriendshipWith(userId, id),
			getBooksForUser(id),
			getReviewsForUser(id)
		])
			.then(([p, f, b, r]) => {
				profile = p;
				friendship = f;
				books = b;
				reviews = r;
			})
			.finally(() => (loading = false));
	});

	async function run(title: string, action: () => Promise<void>) {
		confirmTitle = title;
		if (!(await confirmDialog.confirm())) return;
		busy = true;
		error = '';
		try {
			await action();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
		busy = false;
	}

	const addFriend = () =>
		run(t('Add {name} as friend?').replace('{name}', profile!.username), async () => {
			friendship = await sendFriendRequest(userId, id);
		});

	const removeFriend = () =>
		run(
			friendship?.accepted
				? t('Remove {name} as friend?').replace('{name}', profile!.username)
				: t('Withdraw friend request?'),
			async () => {
				await deleteFriendship(friendship!.id);
				friendship = null;
			}
		);
</script>

<div class="page">
	<button class="back" type="button" aria-label={t('Back')} onclick={() => history.back()}>
		<Icon name="chevron-left" size={32} />
	</button>

	{#if loading}
		<p class="muted">{t('Loading…')}</p>
	{:else if profile}
		<ProfileView
			{profile}
			{books}
			{reviews}
			emptyBooks={t('No books found.')}
			emptyReviews={t('No reviews')}
		>
			{#snippet actions()}
				{#if !friendship}
					<PillButton icon="user-plus" label={t('Add friend')} filled loading={busy} onclick={addFriend} />
				{:else if friendship.accepted}
					<PillButton icon="user-check" label={t('Friends')} loading={busy} onclick={removeFriend} />
				{:else}
					<PillButton icon="user-minus" label={t('Pending')} loading={busy} onclick={removeFriend} />
				{/if}
				<PillButton
					icon="message"
					filled={friendship !== null}
					onclick={() => goto(`/messages/${profile!.id}`)}
				/>
				{#if error}
					<p class="error-text">{error}</p>
				{/if}
			{/snippet}
		</ProfileView>
	{:else}
		<p class="muted">{t('Profile not found.')}</p>
	{/if}
</div>

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	.page {
		padding: 16px 0 40px;
	}
	.back {
		background: none;
		border: none;
		color: var(--on-surface);
		cursor: pointer;
		padding: 0 20px;
		margin-bottom: 4px;
	}
	.error-text {
		width: 100%;
		font-size: 13px;
		color: var(--error);
	}
	.muted {
		padding: 20px;
		color: var(--on-surface-variant);
	}
</style>
