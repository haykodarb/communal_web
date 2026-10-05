<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Avatar from '#lib/components/Avatar.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { getMembershipRequests, respondToMembershipRequest } from '#lib/data/api.ts';
	import type { Membership } from '#lib/data/models.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { profileHref } from '#lib/links.ts';
	import { errorMessage } from '#lib/errors.ts';

	// CommunityRequestsPage: admins accept or reject requests to join.
	let requests = $state<Membership[]>([]);
	let loading = $state(true);
	let busyId = $state<string | null>(null);
	let error = $state('');
	let confirmDialog: ConfirmDialog;
	let confirmTitle = $state('');

	const id = $derived(page.params.id!);

	$effect(() => {
		getMembershipRequests(id)
			.then((result) => (requests = result))
			.catch((e) => (error = errorMessage(e)))
			.finally(() => (loading = false));
	});

	async function respond(request: Membership, accept: boolean) {
		confirmTitle = t(accept ? 'Accept membership request?' : 'Reject membership request?');
		if (!(await confirmDialog.confirm())) return;
		busyId = request.id;
		error = '';
		try {
			await respondToMembershipRequest(request.id, accept);
			requests = requests.filter((r) => r.id !== request.id);
		} catch (e) {
			error = errorMessage(e);
		}
		busyId = null;
	}
</script>

<div class="page">
	<header class="bar">
		<button class="back" type="button" aria-label={t('Back')} onclick={() => goto(`/communities/${id}?tab=members`)}>
			<Icon name="chevron-left" size={28} />
		</button>
		<h1>{t('Requests')}</h1>
	</header>

	{#if error}
		<p class="error-text">{error}</p>
	{/if}

	{#if loading}
		<p class="muted">{t('Loading…')}</p>
	{:else if requests.length === 0}
		<p class="muted">{t('No pending requests.')}</p>
	{:else}
		<ul class="list">
			{#each requests as request (request.id)}
				<li class="request" class:busy={busyId === request.id}>
					<a class="who" href={profileHref(request.member)}>
						<Avatar profile={request.member} size={44} />
						<span>{request.member.username}</span>
					</a>
					<button class="icon accept" type="button" aria-label={t('Accept')} onclick={() => respond(request, true)}>
						<Icon name="check" size={20} />
					</button>
					<button class="icon reject" type="button" aria-label={t('Reject')} onclick={() => respond(request, false)}>
						<Icon name="x" size={20} />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<ConfirmDialog bind:this={confirmDialog} title={confirmTitle} />

<style>
	.page {
		padding: 10px 20px 40px;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
	}
	.back {
		display: flex;
		padding: 4px;
		border: none;
		background: none;
		color: var(--on-surface);
		cursor: pointer;
	}
	h1 {
		font-size: 20px;
		font-weight: 600;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.request {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		border-radius: 10px;
		background: var(--surface-container);
	}
	.request.busy {
		opacity: 0.5;
		pointer-events: none;
	}
	.who {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 12px;
		color: inherit;
		font-weight: 600;
		text-decoration: none;
	}
	.icon {
		display: flex;
		padding: 8px;
		border: none;
		border-radius: 50%;
		cursor: pointer;
	}
	.accept {
		background: var(--primary);
		color: var(--on-primary);
	}
	.reject {
		background: color-mix(in srgb, var(--primary) 15%, transparent);
		color: var(--primary);
	}
	.error-text {
		margin-bottom: 10px;
		font-size: 13px;
		color: var(--error);
	}
	.muted {
		padding: 20px;
		text-align: center;
		color: var(--on-surface-variant);
	}
</style>
