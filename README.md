# Communal Web

A web port of the [Communal](../communal_app) Flutter app — a semi-decentralized
library for sharing physical books (and eventually tools) between members of a
community.

This is a **frontend rewrite**: it talks to the same Supabase backend (same
project, same tables, same RLS) and mirrors the Flutter app's UI as closely as
practical. The Flutter app is the source of truth for domain logic and styling.

## Stack

- **SvelteKit 3** + **Svelte 5** (runes mode) + **TypeScript**
- `@sveltejs/adapter-static` — the app is a client-rendered **SPA** (`ssr = false`,
  `fallback: index.html`)
- `@supabase/supabase-js` for auth, database and storage

## Requirements

- Node.js 20+
- A Supabase project (or access to the existing one)

## Setup

```sh
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key
npm run dev
```

`.env` (only public values are needed — the anon key is safe to expose):

```
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Scripts

```sh
npm run dev        # dev server
npm run build      # static production build → build/
npm run preview    # preview the production build
npm run check      # svelte-check (types + a11y)
```

Because it's a static SPA, the host must serve `index.html` for unknown paths
(client-side routing fallback, e.g. Netlify `/* /index.html 200`).

## Project structure

```
src/
  env.ts                     # declares PUBLIC_* vars for $app/env/public
  lib/
    supabase.ts              # Supabase client
    auth.svelte.ts           # session state + sign in/up/out, password reset
    profile.svelte.ts        # signed-in user's profile (shared by drawer/pages)
    realtime.ts              # one postgres_changes channel, listeners per table
    unread.svelte.ts         # drawer badges: unread notifications/messages
    paged.svelte.ts          # infinite-scroll list state (createPaged)
    links.ts                 # bookHref/profileHref (own vs other user's pages)
    validate.ts              # Flutter-style length validator
    theme.svelte.ts          # light/dark theme (persisted)
    i18n.svelte.ts           # EN/ES strings (t())
    data/
      models.ts              # TS mirrors of the Flutter models
      api.ts                 # Supabase queries/mutations, image upload, signed URLs
    components/              # Button, TextField, Drawer, cards, dialogs, Fab, ...
      community/             # Books / Discuss / Members tabs
  routes/
    +page.svelte, +page.ts   # /: landing page; signed-in users go to /home
    privacy/                 # privacy policy
    app/[...path]/           # old /app/... links redirect to the same page without it
    auth/                    # start, login, register(+resend), recovery, reset, callback
    (signed-in)/             # authenticated shell + pages
      home                   # Home: on loan, reviews by friends, new in your network
      reviews                # every review by your friends
      my-books, my-books/create, my-books/[id], my-books/[id]/edit
      book/[id]              # someone else's book: request a loan
      communities/...        # disabled (lib/features.ts)
      loans, loans/[id]
      my-profile, my-profile/edit, my-profile/account, profile/[id]
      messages, messages/[id]
      friends, notifications, search
```

App routes follow the Flutter app's `lib/routes.dart` (e.g. `/book/:id`,
`/profile/:id`, `/auth/reset`). Signing in, the installed app and "Open
Communal" land on `/home`.

## Backend notes

- Queries mirror `communal_app/lib/backend/*.dart`. Rows are mapped explicitly in
  `src/lib/data/api.ts` (the client is untyped — no generated `Database` type).
- Storage buckets (`book_covers`, `community_avatars`, `profile_avatars`) are
  private, so images are loaded via short-lived **signed URLs** (cached in
  `signedStorageUrl`). Uploads go to `/<userId>/<timestamp>.jpeg` like the
  Flutter app; images are center-cropped and JPEG-encoded client-side
  (`processImage`) instead of using Flutter's interactive cropper.
- Supabase Auth uses PKCE. Google sign-in redirects through `/auth/callback`,
  password recovery through `/auth/reset`, signup confirmation to `/auth`,
  email changes to `/my-profile/account`.
  These URLs must be in the Supabase project's Auth redirect allow-list for
  each origin the app is served from.
- Realtime: `#lib/realtime.ts` ports `RealtimeBackend` (one channel on the
  `public` schema, RLS decides what arrives). Notifications, chats, discussion
  threads and the drawer badges update live.

## Matching the Flutter app

Every screen was compared side by side with the Flutter web build.

- **Icons**: `Icon.svelte` renders the same Atlas glyphs as the Flutter app
  (`static/fonts/atlas`, from the MIT-licensed `atlas_icons` package) plus
  Material paths for Flutter's few `Icons.*`.
- **Avatars**: without a photo, `Avatar.svelte` shows one of Flutter's six
  default emblems (`static/default_avatars`), picked from the username the
  same way as `CommonCircularAvatar`.
- **App bars**: `PageBar` is Flutter's AppBar (centered 18px title). On mobile
  only drawer destinations get the menu bar; pushed pages show their own
  back bar, as in Flutter.
- **Lists** use `CommonListView` spacing (10px padding, 5px gaps, 2-column
  book grids) and load more on scroll (`createPaged` + `Sentinel`).

Bugs found in the Flutter app while comparing (not fixed there):

- On web, `main()` awaits the notification-permission prompt before
  `runApp`, so the app stays blank until the user answers it.
- `BooksBackend.deleteBook` never removes the cover: `image_path` starts
  with `/` but storage object names don't (fixed in this port).
- The loan timeline shows `created_at` for every step.
- The notifications query works, but `getNotificationById` embeds
  `memberships`, which `notifications` has no relationship to, so it fails.
- Search results can show a stale cover (list items reuse their image).

## SvelteKit 3 conventions

- `$lib` was renamed to the Node subpath import **`#lib`** (configured in
  `package.json`).
- Env vars are declared in **`src/env.ts`** with `defineEnvVars` and imported from
  **`$app/env/public`** (the old `$env/static/public` is deprecated).
- `goto()` takes `replace` (not `replaceState`) and `reset: false` instead of
  `noScroll`/`keepFocus`.

## Status

Ported: everything reachable in the Flutter app's UI — auth (incl. resend
confirmation and password reset), books (CRUD, reviews, loan requests), loans
(approve/reject/return, reviews), communities (books, discussions, members,
settings, invites, join requests), profiles and friendships, messages,
notifications, search, realtime updates and unread badges.

Not ported:

- **Push notifications.** The Flutter app registers an FCM token, but its web
  build has no `firebase-messaging-sw.js` or VAPID key, so push only works on
  mobile there. Web push needs a VAPID key from the Firebase console plus a
  service worker.
- `/invitations` and `/search/community/:id` — routes exist in Flutter but
  nothing in its UI links to them (invitations arrive as notifications).

Intentional differences from Flutter are noted in the commit messages (e.g. the
loan timeline shows real accepted/returned dates; deleting a book also deletes
its cover).

Note: `notifications` has `loan` and `friendship` columns but no membership
column, so community-invite notifications carry no membership and can't be
answered from the notifications list (in either app).
