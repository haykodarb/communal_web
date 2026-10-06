<script lang="ts">
	import type { Snippet } from 'svelte';
	import Avatar from './Avatar.svelte';
	import type { Profile } from '#lib/data/models.ts';
	import { profileHref } from '#lib/links.ts';

	// A user in a list (search results, friends): avatar and name linking to
	// the profile, plus optional trailing buttons.
	let { profile, actions }: { profile: Profile; actions?: Snippet } = $props();
</script>

<div class="row">
	<a class="user" href={profileHref(profile)}>
		<Avatar {profile} size={44} />
		<span class="name">{profile.username}</span>
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
	.name {
		font-size: 14px;
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
