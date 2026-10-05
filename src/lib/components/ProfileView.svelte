<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import ReviewCard from './ReviewCard.svelte';
	import TabBar from './TabBar.svelte';
	import VerticalBookCard from './VerticalBookCard.svelte';
	import { signedStorageUrl } from '#lib/data/api.ts';
	import type { Book, Loan, Profile } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';

	// Header, bio and Books/Reviews tabs shared by the own and other profile
	// pages (ProfileCommonHelpers in the Flutter app).
	let {
		profile,
		books,
		reviews,
		emptyBooks,
		emptyReviews,
		actions
	}: {
		profile: Profile;
		books: Book[];
		reviews: Loan[];
		emptyBooks: string;
		emptyReviews: string;
		/** Buttons under the username. */
		actions: Snippet;
	} = $props();

	let avatarUrl = $state<string | null>(null);
	let tab = $state(0);

	$effect(() => {
		const path = profile.avatar_path;
		avatarUrl = null;
		if (path) signedStorageUrl('profile_avatars', path).then((url) => (avatarUrl = url));
	});
</script>

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
		<div class="actions">{@render actions()}</div>
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
		<p class="empty">{emptyBooks}</p>
	{:else}
		<div class="grid">
			{#each books as book (book.id)}
				<VerticalBookCard {book} />
			{/each}
		</div>
	{/if}
{:else if reviews.length === 0}
	<p class="empty">{emptyReviews}</p>
{:else}
	<div class="list">
		{#each reviews as loan (loan.id)}
			<ReviewCard {loan} />
		{/each}
	</div>
{/if}

<style>
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
	.actions {
		margin-top: 10px;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
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
		white-space: pre-line;
		color: var(--on-surface-variant);
	}
</style>
