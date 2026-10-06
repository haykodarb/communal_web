<script lang="ts">
	import { page } from '$app/state';
	import Loading from '#lib/components/Loading.svelte';
	import { goto } from '$app/navigation';
	import PageBar from '#lib/components/PageBar.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import ChatComposer from '#lib/components/ChatComposer.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import {
		getTopicById,
		getTopicMessageById,
		getTopicMessages,
		sendTopicMessage
	} from '#lib/data/api.ts';
	import type { DiscussionMessage, DiscussionTopic } from '#lib/data/models.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { profileHref } from '#lib/links.ts';
	import { currentProfile } from '#lib/profile.svelte.ts';
	import { onTableChange } from '#lib/realtime.ts';
	import { errorMessage } from '#lib/errors.ts';

	// CommunityDiscussionsTopicMessagesPage: a group thread in a topic.
	let topic = $state<DiscussionTopic | null>(null);
	/** Newest first; rendered bottom-up with column-reverse. */
	let messages = $state<DiscussionMessage[]>([]);
	let loading = $state(true);
	let draft = $state('');
	let error = $state('');

	const communityId = $derived(page.params.id!);
	const topicId = $derived(page.params.topicId!);
	const userId = $derived(auth.user!.id);

	$effect(() => {
		loading = true;
		Promise.all([getTopicById(topicId), getTopicMessages(topicId)])
			.then(([tp, msgs]) => {
				topic = tp;
				messages = msgs;
			})
			.catch((e) => (error = errorMessage(e)))
			.finally(() => (loading = false));
	});

	// Other members' new messages arrive over realtime.
	$effect(() =>
		onTableChange('discussion_messages', async (change) => {
			const row = change.newRow;
			if (change.event !== 'INSERT' || row.topic !== topicId || row.sender === userId) return;
			if (messages.some((m) => m.id === row.id)) return;
			const message = await getTopicMessageById(row.id as string);
			if (message) messages = [message, ...messages];
		})
	);

	const received = (m: DiscussionMessage) => m.sender.id !== userId;
	// Index 0 is the newest message. Name + avatar open a run of messages from
	// one sender; the date closes it (Flutter's showAvatar / showTime).
	const startsRun = (i: number) =>
		i === messages.length - 1 || messages[i + 1].sender.id !== messages[i].sender.id;
	const endsRun = (i: number) => i === 0 || messages[i - 1].sender.id !== messages[i].sender.id;

	const formatDate = (date: string) =>
		new Intl.DateTimeFormat(i18n.locale === 'es' ? 'es-ES' : 'en-US', {
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));

	async function send() {
		const content = draft.trim();
		if (!content) return;
		draft = '';
		error = '';
		const tempId = `pending-${Date.now()}`;
		const me = currentProfile.value ?? { id: userId, username: '', show_email: false };
		messages = [
			{ id: tempId, created_at: new Date().toISOString(), sender: me, content, topicId },
			...messages
		];
		try {
			const saved = await sendTopicMessage(userId, topicId, content);
			messages = messages.map((m) => (m.id === tempId ? saved : m));
		} catch {
			messages = messages.filter((m) => m.id !== tempId);
			draft = content;
			error = t('Could not send message, likely network error.');
		}
	}
</script>

<div class="thread">
	<PageBar title={topic?.name ?? ''} onback={() => goto(`/app/communities/${communityId}?tab=discuss`)} />

	<div class="scroll">
		{#if loading}
			<Loading />
		{:else}
			<ol class="messages">
				{#each messages as message, i (message.id)}
					{@const isReceived = received(message)}
					<li class="message" class:received={isReceived}>
						{#if isReceived}
							<span class="avatar-slot">
								{#if startsRun(i)}
									<a href={profileHref(message.sender)}><Avatar profile={message.sender} size={40} /></a>
								{/if}
							</span>
						{/if}
						<div class="column">
							{#if isReceived && startsRun(i)}
								<span class="sender">{message.sender.username}</span>
							{/if}
							<p class="bubble" class:pending={message.id.startsWith('pending-')}>{message.content}</p>
							{#if endsRun(i)}
								<span class="meta">{formatDate(message.created_at)}</span>
							{/if}
						</div>
					</li>
				{/each}
			</ol>
		{/if}
	</div>

	{#if error}
		<p class="error-text">{error}</p>
	{/if}

	<ChatComposer bind:value={draft} onsend={send} />
</div>

<style>
	.thread {
		display: flex;
		flex-direction: column;
		height: 100vh;
		height: 100dvh;
	}
	.scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column-reverse;
	}
	.messages {
		list-style: none;
		margin: 0;
		padding: 16px 20px;
		display: flex;
		flex-direction: column-reverse;
		gap: 5px;
	}
	.message {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
	.message.received {
		justify-content: flex-start;
	}
	.avatar-slot {
		flex: 0 0 40px;
	}
	.column {
		max-width: 80%;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
	}
	.received .column {
		align-items: flex-start;
	}
	.sender {
		font-size: 13px;
		font-weight: 600;
		color: var(--secondary);
	}
	.bubble {
		padding: 15px;
		border-radius: 15px;
		background: color-mix(in srgb, var(--primary) 25%, transparent);
		font-size: 14px;
		line-height: 1.4;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.received .bubble {
		background: color-mix(in srgb, var(--secondary) 25%, transparent);
	}
	.bubble.pending {
		opacity: 0.6;
	}
	.meta {
		font-size: 12px;
		color: var(--on-surface-variant);
	}
	.error-text {
		padding: 0 20px;
		font-size: 13px;
		color: var(--error);
	}
</style>
