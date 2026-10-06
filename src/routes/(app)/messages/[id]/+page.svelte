<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import Loading from '#lib/components/Loading.svelte';
	import { goto } from '$app/navigation';
	import PageBar from '#lib/components/PageBar.svelte';
	import ChatComposer from '#lib/components/ChatComposer.svelte';
	import { getMessagesWith, markMessagesRead, sendMessage } from '#lib/data/api.ts';
	import type { Message, Profile } from '#lib/data/models.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { currentProfile } from '#lib/profile.svelte.ts';
	import { onTableChange } from '#lib/realtime.ts';
	import { unread } from '#lib/unread.svelte.ts';
	import type { PageProps } from './$types';

	// MessagesSpecificPage: one conversation, newest message at the bottom. The
	// newest page comes from the load (through the page cache).
	let { data }: PageProps = $props();
	let chatter = $derived<Profile | null>(data.chat.chatter);
	/** Newest first, as loaded; rendered in reverse with column-reverse. */
	let messages = $derived<Message[]>(data.chat.messages);
	let loadingMore = $state(false);
	let hasMore = $state(true);
	let pageIndex = 1;
	let draft = $state('');
	let error = $state('');
	let top = $state<HTMLElement>();

	const otherId = $derived(page.params.id!);
	const userId = $derived(data.userId);

	// Opening a chat (or switching to another one) starts from its newest page.
	$effect(() => {
		const first = data.chat.messages;
		untrack(() => {
			pageIndex = 1;
			hasMore = first.length === 100;
			markRead();
		});
	});

	const markRead = () => markMessagesRead(userId, otherId).then(() => unread.refreshMessages(userId));

	// Live updates (MessagesSpecificController.messageChangeHandler): incoming
	// messages are appended and marked read, and "Seen" updates in place.
	$effect(() =>
		onTableChange('messages', (change) => {
			if (change.event === 'DELETE') return;
			const row = change.newRow;
			const inThisChat =
				(row.sender === otherId && row.receiver === userId) ||
				(row.sender === userId && row.receiver === otherId);
			if (!inThisChat || !chatter) return;

			const existing = messages.find((m) => m.id === row.id);
			if (existing) {
				existing.is_read = Boolean(row.is_read);
			} else if (row.sender === otherId) {
				const me = currentProfile.value ?? { id: userId, username: '', show_email: false };
				messages = [
					{
						id: row.id as string,
						created_at: row.created_at as string,
						sender: chatter,
						receiver: me,
						content: row.content as string,
						is_read: Boolean(row.is_read)
					},
					...messages
				];
				markRead();
			}
		})
	);

	// Load older messages when scrolled to the top.
	$effect(() => {
		if (!top) return;
		const observer = new IntersectionObserver(async (entries) => {
			if (!entries[0].isIntersecting || loadingMore || !hasMore) return;
			loadingMore = true;
			const older = await getMessagesWith(userId, otherId, pageIndex);
			pageIndex += 1;
			hasMore = older.length === 100;
			messages = [...messages, ...older];
			loadingMore = false;
		});
		observer.observe(top);
		return () => observer.disconnect();
	});

	/** Time under a bubble when the sender changes or 10+ minutes pass (Flutter's showTime). */
	function showTime(index: number): boolean {
		const newer = index > 0 ? messages[index - 1] : null;
		if (!newer || newer.sender.id !== messages[index].sender.id) return true;
		return (
			new Date(newer.created_at).getTime() - new Date(messages[index].created_at).getTime() >
			10 * 60 * 1000
		);
	}

	const formatTime = (date: string) =>
		new Intl.DateTimeFormat(i18n.locale === 'es' ? 'es-ES' : 'en-GB', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));

	async function send() {
		const content = draft.trim();
		if (!content || !chatter) return;
		draft = '';
		error = '';

		// Optimistic bubble, swapped for the stored row once it's saved.
		const tempId = `pending-${Date.now()}`;
		const me = currentProfile.value ?? { id: userId, username: '', show_email: false };
		messages = [
			{
				id: tempId,
				created_at: new Date().toISOString(),
				sender: me,
				receiver: chatter,
				content,
				is_read: false
			},
			...messages
		];
		try {
			const saved = await sendMessage(userId, otherId, content);
			messages = messages.map((m) => (m.id === tempId ? saved : m));
		} catch {
			messages = messages.filter((m) => m.id !== tempId);
			draft = content;
			error = t('Could not send message, likely network error.');
		}
	}
</script>

<div class="chat">
	<!-- Flutter: the chatter's username is the AppBar title. -->
	<PageBar title={chatter?.username ?? ''} onback={() => goto('/messages')} />

	<div class="scroll">
		<ol class="messages">
			{#each messages as message, i (message.id)}
				{@const received = message.sender.id === otherId}
				<li class="message" class:received>
					<p class="bubble" class:pending={message.id.startsWith('pending-')}>{message.content}</p>
					{#if showTime(i)}
						<span class="meta">{formatTime(message.created_at)}</span>
					{/if}
					{#if i === 0 && !received && message.is_read}
						<span class="meta">{t('Seen')}</span>
					{/if}
				</li>
			{/each}
			<li bind:this={top} class="top">
				{#if loadingMore}<Loading size={20} inline />{/if}
			</li>
		</ol>
	</div>

	{#if error}
		<p class="error-text">{error}</p>
	{/if}

	<ChatComposer bind:value={draft} onsend={send} />
</div>

<style>
	.chat {
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
	/* column-reverse keeps the newest message (first in the list) at the bottom. */
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
		flex-direction: column;
		align-items: flex-end;
		gap: 5px;
	}
	.message.received {
		align-items: flex-start;
	}
	.bubble {
		max-width: 80%;
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
	.top {
		min-height: 1px;
		text-align: center;
	}
	.error-text {
		padding: 0 20px;
		font-size: 13px;
		color: var(--error);
	}
</style>
