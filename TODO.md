# TODO

Polish pass, in suggested order. Paths are relative to `src/` unless noted.

## Speed

- [ ] **Cover and avatar thumbnails** (later, with Supabase Pro image transformations). Covers are served at full size: avg 294 KB,
      p90 1 MB, max 2.1 MB (community avatars avg 439 KB, often shown at 40px). Make a
      ~400px WebP thumbnail on upload and use it in grids/lists; backfill existing
      covers with a one-off script. (`lib/components/CoverImage.svelte`,
      `lib/components/Avatar.svelte`, `lib/data/api.ts` signing)
- [x] **nginx compression and caching** (`/etc/nginx/conf.d/communal.conf` on the
      server). JS, CSS, SVG and JSON go out uncompressed and nothing has
      Cache-Control. Add `gzip_types` for those, and cache `/_app/immutable/` and
      `/fonts/` for a year as `immutable`.
- [x] **Shrink the crow.** `static/crow.svg` and `static/assets/crow.svg` are ~600 KB
      each (one huge high-precision path); Chrome's renderer froze for ~30s on the
      auth page. svgo `--precision 1` gets it to 80 KB gzipped (check it visually), or
      use a 2x WebP/PNG since it shows at ~300px. Keep a single copy.
- [x] **Icon fonts.** 31 icons pull in 8 Atlas fonts (~510 KB), with
      `font-display: block` so icons stay invisible until each loads. Subset the used
      glyphs into one WOFF2 (~10 KB) or switch to inline SVG.
      (`lib/components/Icon.svelte`, `app.css:296`)
- [x] **Poppins as WOFF2.** Five TTF weights (~760 KB) → Latin-subset WOFF2
      (~100 KB, keep Spanish accents); preload Regular. Delete the unused
      `static/fonts/Poppins-Light.ttf`.
- [x] **First-paint shell.** The page is blank beige until JS runs; put a CSS loader
      or crow in `app.html`.

## Look and feel

- [ ] **Toasts.** No feedback after saving a book, saving the profile, deleting, or
      requesting a loan; pages just `goto()` away. Add a toast store with an
      `aria-live="polite"` region in the root layout.
- [ ] **Shared `EmptyState` and `ErrorState`.** Only home's empty state has an action;
      most lists show a plain sentence, errors are a red sentence with no retry, and
      the error classes/sizes and margins differ per page. My Books says to use "the
      floating button on the bottom right" instead of offering a button; Friends says
      "Find people in Search" with no link. Affects my-books, loans, search, reviews,
      friends, notifications, messages, home.
- [ ] **Page titles.** Only 2 of 36 routes set `<title>`. Feed them from the `titles`
      map in `routes/(signed-in)/+layout.svelte`.
- [ ] **Dark mode.**
  - [ ] Update `theme-color` when the theme changes (`lib/theme.svelte.ts`,
        `app.html:7`).
  - [ ] Default to `prefers-color-scheme` instead of light.
  - [ ] Add a `--success` token for the hard-coded `#7dae6b` (`BookCard.svelte`,
        `StatusBadge.svelte`).
- [ ] **Default language from the browser** (`navigator.language` starting with `es`)
      in `lib/i18n.svelte.ts` `readInitial()`.
- [ ] **Mobile drawer as a real modal.** Escape doesn't close it, focus isn't moved in
      or restored, the background isn't inert. Use `<dialog>` + `showModal()` like
      FilterSheet. (`routes/(signed-in)/+layout.svelte`)
- [ ] **Drawer items as links** (`<a href aria-current>`) instead of buttons with
      `goto()`, for middle-click, hover preload and `aria-current="page"`.
      (`lib/components/Drawer.svelte`)
- [ ] **Link previews.** Add meta description and `og:*` and `twitter:*` tags to
      `app.html` (SSR is off, so bots only see that file).

## Bugs and details

- [ ] **Username rules conflict.** Register allows ≥3 characters, profile edit
      requires 6–20, so short usernames can't save their profile. Share one validator
      in `lib/validate.ts`. (`routes/auth/register/+page.svelte:24`,
      `routes/(signed-in)/my-profile/edit/+page.svelte:51`)
- [ ] **Search "no users" message.** A normal zero-result search says "No users found,
      likely a network issue." Say "No users match …" and echo the query.
      (`routes/(signed-in)/search/+page.svelte:135`)
- [ ] **Confirm dialog.**
  - [ ] Focus Cancel first, not "Yes" (Enter right after opening "Delete account"
        deletes it).
  - [ ] Add a danger variant with explicit labels like "Delete".
  - [ ] Add `aria-labelledby`.
  - [ ] Make the Delete account button look destructive.
  - (`lib/components/ConfirmDialog.svelte`,
    `routes/(signed-in)/my-profile/account/+page.svelte`)
- [ ] **Unsaved-changes guard** with `beforeNavigate` on BookForm and profile edit.
- [ ] **Search bar focus style.** The input has `outline: none` and nothing replaces
      it; add `.search:focus-within`. (`lib/components/SearchBar.svelte:87`)
- [ ] **Touch targets under 40px:**
  - [ ] search clear button (28px)
  - [ ] password toggle (32px)
  - [ ] PillButton (35px)
  - [ ] notification Accept/Reject (30px tall)
  - [ ] BackButton (~38px)
  - [ ] messages delete button (~34px, hidden until hover)
- [ ] **CoverImage loading vs failed** render the same icon; show a shimmer while
      loading and a distinct fallback on failure. (`lib/components/CoverImage.svelte:40`)
- [ ] **Not-found pages have no way back** on mobile
      (`routes/(signed-in)/book/[id]/+page.svelte`,
      `routes/(signed-in)/my-books/[id]/+page.svelte`); the signed-in 404 page offers
      no link out either.
- [ ] **Book edit hides load failures** as "Book not found" (no `.catch`).
      (`routes/(signed-in)/my-books/[id]/edit/+page.svelte:20`)
- [ ] **IME-safe Enter** (`event.isComposing`) in TextField and ChatComposer; disable
      Send when the message is empty.
- [ ] **Forms.** Add `aria-invalid` and `aria-describedby` for errors, a label that
      stays visible once the user types, focus the first invalid field on submit, and
      `autocomplete` hints. (`lib/components/TextField.svelte`, `BookForm.svelte`)
- [ ] **Accessibility labels.**
  - [ ] Icon-only PillButton announces the raw icon id ("comment-dots-bold").
  - [ ] TabBar lacks `tablist`/`tab`/`aria-selected`.
  - [ ] FilterSheet has no title or close button.
- [ ] **Loading spinner ignores reduced motion** (JS animation loop in
      `lib/components/Loading.svelte`).
- [ ] **Consistency.**
  - [ ] Add `pressable` to the UserRow and NotificationCard links.
  - [ ] Use one disabled opacity (Button 0.55 vs PillButton 0.6).
- [ ] **i18n leftovers.**
  - [ ] Wrap "Version:" (`Drawer.svelte`) and the "Loading" aria-labels in `t()`.
  - [ ] ImagePicker's aria-label contains a newline.
  - [ ] Fix the "succesfully" typo in `routes/auth/reset/+page.svelte`.
