<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Avatar from '#lib/components/Avatar.svelte';
	import ChatComposer from '#lib/components/ChatComposer.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { getMessagesWith, getProfile, markMessagesRead, sendMessage } from '#lib/data/api.ts';
	import type { Message, Profile } from '#lib/data/models.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { currentProfile } from '#lib/profile.svelte.ts';
	import { profileHref } from '#lib/links.ts';
	import { onTableChange } from '#lib/realtime.ts';
	import { unread } from '#lib/unread.svelte.ts';

	// MessagesSpecificPage: one conversation, newest message at the bottom.
	let chatter = $state<Profile | null>(null);
	/** Newest first, as loaded; rendered in reverse with column-reverse. */
	let messages = $state<Message[]>([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let hasMore = $state(true);
	let pageIndex = 0;
	let draft = $state('');
	let error = $state('');
	let top = $state<HTMLElement>();

	const otherId = $derived(page.params.id!);
	const userId = $derived(auth.user!.id);

	$effect(() => {
		loading = true;
		pageIndex = 0;
		Promise.all([getProfile(otherId), getMessagesWith(userId, otherId, 0)])
			.then(([profile, first]) => {
				chatter = profile;
				messages = first;
				hasMore = first.length === 100;
				pageIndex = 1;
				markRead();
			})
			.catch((e) => (error = e instanceof Error ? e.message : String(e)))
			.finally(() => (loading = false));
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
			if (!entries[0].isIntersecting || loadingMore || !hasMore || loading) return;
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
	<header class="bar">
		<button class="back" type="button" aria-label={t('Back')} onclick={() => goto('/messages')}>
			<Icon name="chevron-left" size={28} />
		</button>
		{#if chatter}
			<a class="who" href={profileHref(chatter)}>
				<Avatar profile={chatter} size={36} />
				<span>{chatter.username}</span>
			</a>
		{/if}
	</header>

	<div class="scroll">
		{#if loading}
			<p class="muted">{t('Loading…')}</p>
		{:else}
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
					{#if loadingMore}<span class="muted">{t('Loading…')}</span>{/if}
				</li>
			</ol>
		{/if}
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
	/* Below the 56px app bar of the mobile shell (see (app)/+layout.svelte). */
	@media (max-width: 799px) {
		.chat {
			height: calc(100dvh - 56px);
		}
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border-bottom: 1px solid color-mix(in srgb, var(--on-surface-variant) 30%, transparent);
	}
	.back {
		display: flex;
		background: none;
		border: none;
		color: var(--on-surface);
		cursor: pointer;
		padding: 4px;
	}
	.who {
		display: flex;
		align-items: center;
		gap: 10px;
		color: inherit;
		font-weight: 600;
		text-decoration: none;
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
	.muted {
		padding: 20px;
		text-align: center;
		color: var(--on-surface-variant);
	}
</style>
