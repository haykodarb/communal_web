<script lang="ts">
	import SearchBar from '../SearchBar.svelte';
	import Sentinel from '../Sentinel.svelte';
	import { getTopics } from '#lib/data/api.ts';
	import type { DiscussionTopic } from '#lib/data/models.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { createPaged } from '#lib/paged.svelte.ts';

	// CommunityDiscussionsPage: the community's topics with their last message.
	let { communityId }: { communityId: string } = $props();

	const PAGE_SIZE = 20;
	let search = $state('');
	const topics = createPaged<DiscussionTopic>(
		(page) => getTopics(communityId, { search, page, pageSize: PAGE_SIZE }),
		PAGE_SIZE
	);

	const formatDate = (date: string) =>
		new Intl.DateTimeFormat(i18n.locale === 'es' ? 'es-ES' : 'en-US', {
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
</script>

<div class="search"><SearchBar bind:value={search} onSearch={() => topics.reset()} /></div>

{#if topics.items.length > 0}
	<ul class="list">
		{#each topics.items as topic (topic.id)}
			<li>
				<a class="topic" href={`/communities/${communityId}/discussions/${topic.id}`}>
					<div class="top">
						<span class="name">{topic.name}</span>
						<span class="date">{formatDate(topic.last_message?.created_at ?? topic.created_at)}</span>
					</div>
					{#if topic.last_message}
						<span class="preview">
							<strong>{topic.last_message.sender.username}:</strong>
							{topic.last_message.content}
						</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
{:else if !topics.loading && !topics.hasMore}
	<p class="empty">{topics.error || t('community-topics-no-items')}</p>
{/if}
{#if topics.loading}
	<p class="muted">{t('Loading…')}</p>
{/if}
<Sentinel onvisible={topics.loadMore} />

<style>
	.search {
		padding: 10px 20px;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0 10px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.topic {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 15px;
		border-radius: 12px;
		background: var(--surface-container);
		color: inherit;
		text-decoration: none;
	}
	.top {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}
	.name {
		flex: 1;
		min-width: 0;
		font-size: 16px;
		font-weight: 600;
	}
	.date {
		font-size: 12px;
		color: var(--on-surface-variant);
	}
	.preview {
		font-size: 13px;
		color: var(--on-surface-variant);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.preview strong {
		font-weight: 600;
		color: var(--secondary);
	}
	.empty,
	.muted {
		padding: 30px 20px;
		text-align: center;
		white-space: pre-line;
		color: var(--on-surface-variant);
	}
</style>
