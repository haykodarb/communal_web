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
    auth.svelte.ts           # session state + sign in/up/out helpers
    theme.svelte.ts          # light/dark theme (persisted)
    i18n.svelte.ts           # EN/ES strings (t())
    data/
      models.ts              # TS mirrors of the Flutter models
      api.ts                 # Supabase queries + signed storage URLs
    components/              # Button, TextField, Drawer, SearchBar, cards, ...
  routes/
    +page.svelte             # landing carousel
    auth/                    # start, login, register, recovery, callback
    (app)/                   # authenticated shell + pages
      my-books/[id], my-books/create
      communities/[id], communities/create
      loans/[id]
      my-profile/edit
      search, messages, notifications
```

## Backend notes

- Queries mirror `communal_app/lib/backend/*.dart`. Rows are mapped explicitly in
  `src/lib/data/api.ts` (the client is untyped — no generated `Database` type).
- Storage buckets (`book_covers`, `community_avatars`, `profile_avatars`) are
  private, so images are loaded via short-lived **signed URLs** (cached in
  `signedStorageUrl`).
- Supabase Auth uses PKCE; Google sign-in redirects through `/auth/callback`.

## SvelteKit 3 conventions

- `$lib` was renamed to the Node subpath import **`#lib`** (configured in
  `package.json`).
- Env vars are declared in **`src/env.ts`** with `defineEnvVars` and imported from
  **`$app/env/public`** (the old `$env/static/public` is deprecated).

## Status

Ported: landing, full auth flow, authenticated shell (centered drawer + content
columns, mobile app bar/drawer), **My Books** (list + search + detail),
**Communities** (list + detail), **Loans** (list + detail), **Profile**
(header, bio, Books/Reviews tabs), and search.

Not yet ported: create/edit forms (book, community, profile), messages,
notifications, discussions, realtime, and push. Detail/create routes exist as
placeholders where noted.
