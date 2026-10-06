<script lang="ts">
	import FillCenter from '#lib/components/FillCenter.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import PageBar from '#lib/components/PageBar.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import PillButton from '#lib/components/PillButton.svelte';
	import ProfileView from '#lib/components/ProfileView.svelte';
	import { deleteFriendship, sendFriendRequest } from '#lib/data/api.ts';
	import type { Friendship, Profile } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { errorMessage } from '#lib/errors.ts';
	import type { PageProps } from './$types';

	// Another user's profile (ProfileOtherPage), with friendship and message
	// buttons. Everything comes from the load (through the page cache).
	let { data }: PageProps = $props();
	const profile = $derived<Profile | null>(data.person.profile);
	let friendship = $derived<Friendship | null>(data.person.friendship);
	const mutual = $derived<Profile[]>(data.person.mutual);
	let busy = $state(false);
	let error = $state('');

	let confirmDialog: ConfirmDialog;
	let confirmTitle = $state('');

	const id = $derived(page.params.id!);
	const userId = $derived(data.userId);

	async function run(title: string, action: () => Promise<void>) {
		confirmTitle = title;
		if (!(await confirmDialog.confirm())) return;
		busy = true;
		error = '';
		try {
			await action();
		} catch (e) {
			error = errorMessage(e);
		}
		busy = false;
	}

	/** How you're connected to a friend of a friend ("via <friend>"). */
	const viaNote = $derived.by(() => {
		if (friendship?.accepted || mutual.length === 0) return undefined;
		const first = t('via {name}').replace('{name}', mutual[0].username);
		return mutual.length === 1
			? first
			: `${first} ${t('and {n} more').replace('{n}', String(mutual.length - 1))}`;
	});

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
	<PageBar title={t('Profile')} onback={() => history.back()} />

	{#if profile}
		{#key profile.id}
		<ProfileView
			{profile}
			lists={data.lists}
			emptyBooks={t('No books.')}
			emptyReviews={t('No reviews.')}
			note={viaNote}
		>
			{#snippet actions()}
				{#if !friendship}
					<PillButton icon="user-plus-bold" label={t('Add friend')} filled loading={busy} onclick={addFriend} />
				{:else if friendship.accepted}
					<PillButton icon="user-check" label={t('Friends')} loading={busy} onclick={removeFriend} />
				{:else}
					<PillButton icon="user-minus" label={t('Pending')} loading={busy} onclick={removeFriend} />
				{/if}
				<PillButton
					icon="comment-dots-bold"
					filled={friendship !== null}
					onclick={() => goto(`/app/messages/${profile!.id}`)}
				/>
				{#if error}
					<p class="error-text">{error}</p>
				{/if}
			{/snippet}
		</ProfileView>
		{/key}
	{:else}
		<FillCenter><p class="muted">{t('Profile not found.')}</p></FillCenter>
	{/if}
</div>

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	.page {
		padding: 0 0 40px;
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
