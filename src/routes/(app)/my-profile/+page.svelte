<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '#lib/components/Icon.svelte';
	import ReviewCard from '#lib/components/ReviewCard.svelte';
	import TabBar from '#lib/components/TabBar.svelte';
	import VerticalBookCard from '#lib/components/VerticalBookCard.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import {
		getBooksForUser,
		getProfile,
		getReviewsForUser,
		signedStorageUrl
	} from '#lib/data/api.ts';
	import type { Book, Loan, Profile } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	let profile = $state<Profile | null>(null);
	let avatarUrl = $state<string | null>(null);
	let books = $state<Book[]>([]);
	let reviews = $state<Loan[]>([]);
	let loading = $state(true);
	let tab = $state(0);

	$effect(() => {
		const userId = auth.user?.id;
		if (!userId) return;
		loading = true;
		Promise.all([getProfile(userId), getBooksForUser(userId), getReviewsForUser(userId)])
			.then(async ([p, b, r]) => {
				profile = p;
				books = b;
				reviews = r;
				if (p?.avatar_path) {
					avatarUrl = await signedStorageUrl('profile_avatars', p.avatar_path);
				}
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

<div class="page">
	{#if loading}
		<p class="muted">{t('Loading…')}</p>
	{:else if profile}
		<div class="header">
			<div class="avatar">
				{#if avatarUrl}
					<img src={avatarUrl} alt="" />
				{:else}
					<Icon name="user" size={44} />
				{/if}
			</div>
			<div class="info">
				<span class="username">{profile.username}</span>
				{#if profile.email}
					<span class="email">{profile.email}</span>
				{/if}
				<button class="edit" type="button" onclick={() => goto('/my-profile/edit')}>
					<Icon name="pencil" size={16} />
					<span>{t('Edit profile')}</span>
				</button>
			</div>
		</div>

		{#if profile.bio}
			<div class="bio">
				<span class="bio-title">{t('About me')}</span>
				<p class="bio-text">{profile.bio}</p>
			</div>
		{/if}

		<div class="tabs">
			<TabBar tabs={[t('Books'), t('Reviews')]} index={tab} onchange={(i) => (tab = i)} />
		</div>

		{#if tab === 0}
			{#if books.length === 0}
				<p class="empty">{t('You have not uploaded any books.')}</p>
			{:else}
				<div class="grid">
					{#each books as book (book.id)}
						<VerticalBookCard {book} />
					{/each}
				</div>
			{/if}
		{:else if reviews.length === 0}
			<p class="empty">{t('You have not reviewed any books yet.')}</p>
		{:else}
			<div class="list">
				{#each reviews as loan (loan.id)}
					<ReviewCard {loan} />
				{/each}
			</div>
		{/if}
	{:else}
		<p class="muted">{t('Profile not found.')}</p>
	{/if}
</div>

<style>
	.page {
		padding: 10px 0 40px;
	}
	.header {
		display: flex;
		gap: 20px;
		padding: 10px 20px;
	}
	.avatar {
		width: 105px;
		height: 105px;
		flex: 0 0 105px;
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--primary) 18%, transparent);
		color: var(--primary);
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.username {
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
	}
	.email {
		font-size: 16px;
		color: var(--on-surface-variant);
	}
	.edit {
		align-self: flex-start;
		margin-top: 10px;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 35px;
		padding: 0 12px;
		border: 2px solid var(--primary);
		border-radius: 999px;
		background: none;
		color: var(--primary);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
	}
	.bio {
		padding: 10px 20px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.bio-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--secondary);
	}
	.bio-text {
		font-size: 14px;
		line-height: 1.4;
	}
	.tabs {
		padding: 5px 20px 10px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 10px;
		padding: 10px 20px;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px 20px;
	}
	.empty {
		padding: 30px 20px;
		text-align: center;
		color: var(--on-surface-variant);
	}
	.muted {
		padding: 20px;
		color: var(--on-surface-variant);
	}
</style>
