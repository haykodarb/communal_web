<script lang="ts">
	import Avatar from '#lib/components/Avatar.svelte';
	import Loading from '#lib/components/Loading.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { auth } from '#lib/auth.svelte.ts';
	import { deleteChatWith, getChats } from '#lib/data/api.ts';
	import type { Message, Profile } from '#lib/data/models.ts';
	import { i18n, t } from '#lib/i18n.svelte.ts';
	import { onTableChange } from '#lib/realtime.ts';
	import { errorMessage } from '#lib/errors.ts';

	// MessagesPage: one row per conversation with its latest message.
	let chats = $state<Message[]>([]);
	let loading = $state(true);
	let error = $state('');
	let confirmDialog: ConfirmDialog;

	const userId = $derived(auth.user!.id);

	const load = () =>
		getChats()
			.then((result) => (chats = result))
			.catch((e) => (error = errorMessage(e)))
			.finally(() => (loading = false));

	$effect(() => {
		load();
	});

	// Refresh the list when a message to or from this user changes.
	let debounce: ReturnType<typeof setTimeout> | undefined;
	$effect(() =>
		onTableChange('messages', (change) => {
			const row = change.event === 'DELETE' ? change.oldRow : change.newRow;
			if (row.sender !== userId && row.receiver !== userId && change.event !== 'DELETE') return;
			clearTimeout(debounce);
			debounce = setTimeout(load, 500);
		})
	);

	const chatter = (chat: Message): Profile =>
		chat.sender.id === userId ? chat.receiver : chat.sender;

	const unread = (chat: Message) => (chat.unread_messages ?? 0) > 0 && chat.receiver.id === userId;

	const formatDate = (date: string) =>
		new Intl.DateTimeFormat(i18n.locale === 'es' ? 'es-ES' : 'en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));

	async function remove(chat: Message) {
		if (!(await confirmDialog.confirm())) return;
		const other = chatter(chat);
		try {
			await deleteChatWith(other.id);
			chats = chats.filter((c) => chatter(c).id !== other.id);
		} catch (e) {
			error = errorMessage(e);
		}
	}
</script>

<div class="page">
	{#if error}
		<p class="error-text">{error}</p>
	{/if}

	{#if loading}
		<Loading />
	{:else if chats.length === 0}
		<div class="empty">
			<Icon name="message" size={40} />
			<p>{t('No messages yet.')}</p>
		</div>
	{:else}
		<ul class="list">
			{#each chats as chat (chat.id)}
				{@const other = chatter(chat)}
				<li class="row">
					<a class="chat" href={`/messages/${other.id}`}>
						<Avatar profile={other} size={50} />
						<div class="body">
							<div class="top">
								<span class="name">{other.username}</span>
								<span class="date" class:highlight={unread(chat)}>{formatDate(chat.created_at)}</span>
							</div>
							<div class="bottom">
								<span class="preview">{chat.content}</span>
								{#if unread(chat)}
									<span class="badge">{chat.unread_messages}</span>
								{/if}
							</div>
						</div>
					</a>
					<button
						class="delete"
						type="button"
						aria-label={t('Delete chat?')}
						onclick={() => remove(chat)}
					>
						<Icon name="trash" size={18} />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<ConfirmDialog bind:this={confirmDialog} title={t('Delete chat?')} />

<style>
	/* CommonListView padding/separators; each chat is a 90px Card. */
	.page {
		padding: 10px;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.row {
		position: relative;
		display: flex;
		align-items: center;
		height: 90px;
		border-radius: 10px;
		background: var(--surface-container);
	}
	.chat {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px;
		color: inherit;
		text-decoration: none;
	}
	.body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.top,
	.bottom {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.name {
		flex: 1;
		min-width: 0;
		font-size: 16px;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.date {
		font-size: 12px;
		color: var(--on-surface-variant);
	}
	.date.highlight {
		color: var(--primary);
	}
	.preview {
		flex: 1;
		min-width: 0;
		font-size: 12px;
		color: var(--on-surface-variant);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.badge {
		min-width: 20px;
		padding: 2px 6px;
		border-radius: 999px;
		background: var(--primary);
		color: var(--on-primary);
		font-size: 12px;
		font-weight: 600;
		text-align: center;
	}
	/* Flutter deletes on long-press; here a hover button overlays the card corner. */
	.delete {
		position: absolute;
		bottom: 4px;
		right: 4px;
		display: flex;
		padding: 8px;
		border: none;
		border-radius: 50%;
		background: none;
		color: var(--on-surface-variant);
		cursor: pointer;
		opacity: 0;
		transition: opacity 150ms ease;
	}
	.row:hover .delete,
	.delete:focus-visible {
		opacity: 1;
	}
	@media (hover: none) {
		.delete {
			opacity: 1;
		}
	}
	.empty {
		margin-top: 50px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		color: var(--on-surface-variant);
	}
	.error-text {
		padding: 0 20px 12px;
		text-align: center;
		font-size: 14px;
		color: var(--error);
	}
</style>
