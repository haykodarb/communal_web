<script lang="ts">
	import Avatar from '../Avatar.svelte';
	import Loading from '../Loading.svelte';
	import SearchBar from '../SearchBar.svelte';
	import StickySearch from '../StickySearch.svelte';
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
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
</script>

<StickySearch>
	<div class="search"><SearchBar bind:value={search} onSearch={() => topics.reset()} /></div>
</StickySearch>

{#if topics.items.length > 0}
	<ul class="list">
		{#each topics.items as topic (topic.id)}
			{@const who = topic.last_message?.sender ?? topic.creator}
			<li>
				<a class="topic" href={`/communities/${communityId}/discussions/${topic.id}`}>
					<span class="name">{topic.name}</span>
					<div class="row">
						<Avatar profile={who} size={50} />
						<div class="lines">
							<div class="top">
								<span class="who">{who.username}</span>
								<span class="date">{formatDate(topic.last_message?.created_at ?? topic.created_at)}</span>
							</div>
							<span class="preview">{topic.last_message?.content ?? t('Created this topic')}</span>
						</div>
					</div>
				</a>
			</li>
		{/each}
	</ul>
{:else if !topics.loading && !topics.hasMore}
	<p class="empty">{topics.error || t('community-topics-no-items')}</p>
{/if}
{#if topics.loading}
	<Loading />
{/if}
<Sentinel onvisible={topics.loadMore} />

<style>
	.search {
		padding: 0 10px;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0 10px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	/* Flutter topic Card: 20px padding, name then the latest activity row. */
	.topic {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 20px;
		border-radius: 10px;
		background: var(--surface-container);
		color: inherit;
		text-decoration: none;
	}
	.name {
		font-size: 16px;
		font-weight: 600;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.lines {
		flex: 1;
		min-width: 0;
		font-size: 14px;
	}
	.top {
		display: flex;
		gap: 10px;
	}
	.who {
		flex: 1;
		min-width: 0;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.date,
	.preview {
		color: var(--on-surface-variant);
	}
	.preview {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.empty {
		padding: 30px 20px;
		text-align: center;
		white-space: pre-line;
		color: var(--on-surface-variant);
	}
</style>
