<script lang="ts">
	import type { Snippet } from 'svelte';
	import Avatar from './Avatar.svelte';
	import type { Profile } from '#lib/data/models.ts';
	import { profileHref } from '#lib/links.ts';

	// A user in a list (search results, friends): avatar and name linking to
	// the profile, an optional second line and trailing buttons.
	let {
		profile,
		subtitle,
		actions
	}: { profile: Profile; subtitle?: string | null; actions?: Snippet } = $props();
</script>

<div class="row">
	<a class="user" href={profileHref(profile)}>
		<Avatar {profile} size={44} />
		<span class="text">
			<span class="name">{profile.username}</span>
			{#if subtitle}<span class="subtitle">{subtitle}</span>{/if}
		</span>
	</a>
	{#if actions}
		<div class="actions">{@render actions()}</div>
	{/if}
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		border-radius: 10px;
		background: var(--surface-container);
	}
	.user {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 12px;
		color: inherit;
		text-decoration: none;
	}
	.text {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.name {
		font-size: 14px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.subtitle {
		font-size: 12px;
		color: var(--on-surface-variant);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.actions {
		flex: 0 0 auto;
		display: flex;
		gap: 5px;
	}
</style>
