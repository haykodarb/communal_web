<script lang="ts" module>
	// The Flutter app uses Atlas icons (atlas_icons package) plus a few Material
	// `Icons.*`. Atlas glyphs render from the same fonts (static/fonts/atlas);
	// Material ones are drawn from their 24px SVG paths (Apache-2.0).

	/**
	 * name -> [Atlas font family suffix, code point, optional scale], from
	 * atlas_icons.dart. The scale enlarges a glyph that draws smaller than its
	 * neighbours (keeping its proportions and its 1em slot).
	 */
	const ATLAS: Record<string, [string, number, number?]> = {
		account: ['basic-ui', 0xe96d], // drawer Profile, avatar fallback
		user: ['basic-ui', 0xe96d],
		'account-arrows': ['marketing', 0xe946], // drawer Loans
		loans: ['marketing', 0xe946],
		'users-arrows': ['marketing', 0xe987], // loan notifications
		'add-messages': ['content-box', 0xe967], // new topic FAB
		bell: ['thanksgiving', 0xe937],
		// drawer Home; the house is wide and short (about 26x22.6 at 1em), so it
		// is scaled up to roughly the height of the other drawer icons.
		home: ['basic-ui', 0xe997, 1.12],
		book: ['school', 0xe933], // community Books tab
		library: ['school', 0xe945], // drawer My Books
		camera: ['travel', 0xe953],
		chats: ['content-box', 0xe975], // drawer Messages, Discuss tab
		message: ['content-box', 0xe975],
		'comment-dots': ['content-box', 0xe97e], // member row message button
		'comment-dots-bold': ['content-box', 0xe9e0], // profile message button
		logout: ['arrow', 0xe9d7], // double_arrow_right_circle
		envelope: ['basic-ui', 0xe991],
		gear: ['basic-ui', 0xe996],
		sliders: ['basic-ui', 0xe998], // horizontal_sliders_dots
		image: ['basic-ui', 0xe99a], // image_gallery
		search: ['basic-ui', 0xe9aa], // magnifying_glass
		moon: ['weather', 0xe98b], // moon_bold
		sun: ['weather', 0xe9a6], // sunny_bold
		pencil: ['school', 0xe94e],
		pin: ['school', 0xe952],
		'user-plus': ['basic-ui', 0xe9d1],
		'user-plus-bold': ['basic-ui', 0xea3e],
		'user-check': ['basic-ui', 0xea3c], // user_check_bold
		'user-minus': ['basic-ui', 0xea3d], // user_minus_bold
		community: ['basic-ui', 0xe9d2], // users
		users: ['basic-ui', 0xe9d2]
	};

	/** Material icon paths for the `Icons.*` the Flutter app uses. */
	const MATERIAL: Record<string, string> = {
		'chevron-left': 'M14.71 6.71a.996.996 0 0 0-1.41 0L8.71 11.3a.996.996 0 0 0 0 1.41l4.59 4.59a.996.996 0 1 0 1.41-1.41L10.83 12l3.88-3.88c.39-.39.38-1.03 0-1.41z',
		'chevron-right': 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
		check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
		x: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
		plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
		send: 'M3.4 20.4l17.45-7.48c.81-.35.81-1.49 0-1.84L3.4 3.6c-.66-.29-1.39.2-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z',
		eye: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
		'eye-off': 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
		menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
		more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
		trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'
	};
</script>

<script lang="ts">
	let { name, size = 24 }: { name: string; size?: number } = $props();

	const atlas = $derived(ATLAS[name]);
</script>

{#if atlas}
	<span
		class="atlas"
		style:font-family="'Atlas-{atlas[0]}'"
		style:font-size="{size}px"
		style:transform={atlas[2] ? `scale(${atlas[2]})` : undefined}
		aria-hidden="true">{String.fromCodePoint(atlas[1])}</span
	>
{:else}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d={MATERIAL[name] ?? ''} />
	</svg>
{/if}

<style>
	.atlas {
		display: inline-block;
		width: 1em;
		height: 1em;
		line-height: 1;
		font-style: normal;
		font-weight: normal;
		text-align: center;
		-webkit-font-smoothing: antialiased;
	}
	svg {
		flex: 0 0 auto;
	}
</style>
