<script lang="ts">
	import Avatar from './Avatar.svelte';
	import type { Profile } from '#lib/data/models.ts';
	import { profileHref } from '#lib/links.ts';

	// A person inline: their avatar and username, linking to their profile (your
	// own goes to My Profile). Hovering draws an underline under the name from
	// left to right; it shrinks back from right to left when the pointer leaves.
	// The font size comes from where it's used. `avatar={false}` leaves the
	// picture out, for layouts that place it themselves.
	let {
		profile,
		size = 20,
		avatar = true
	}: { profile: Profile; size?: number; avatar?: boolean } = $props();
</script>

<a class="user-link" href={profileHref(profile)}>
	{#if avatar}<Avatar {profile} {size} />{/if}
	<span class="name">{profile.username}</span>
</a>

<style>
	.user-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		max-width: 100%;
		vertical-align: middle;
		font-weight: 500;
		color: var(--primary);
		text-decoration: none;
	}
	/* The underline is a 1px background stripe whose width grows from the left:
	   backgrounds are snapped to whole pixels, so it's equally crisp wherever the
	   name sits (a transformed line lands on fractional pixels and blurs by
	   different amounts). Anchored left, it shrinks back right to left. */
	.name {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding-bottom: 2px;
		background: linear-gradient(currentColor, currentColor) left bottom / 0% 1px no-repeat;
		transition: background-size 220ms var(--ease-standard);
	}
	@media (hover: hover) {
		.user-link:hover .name {
			background-size: 100% 1px;
		}
	}
	.user-link:focus-visible .name {
		background-size: 100% 1px;
	}
</style>
