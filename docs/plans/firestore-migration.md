# Migrate the live Nuxt site to SvelteKit + Firestore

**Status:** in-progress — updated 2026-06-07

## Resume here

Port the draw flow: `src/routes/draw/+page.svelte` + `draw.remote.ts`, the toolbar/colour picker and the save modal. Then gallery routes, corpse/section detail, admin. The Firestore domain layer (`packages/firestore`) is done and compiles.

## Steps

- [x] Push `atproto` to origin so the rewrite work is safe
- [x] Branch `firestore` from `atproto`; prune atproto routes, auth and the component-library experiment
- [x] Add `@sveltejs/adapter-netlify`, `sass`, ported static assets (icons/cursor/tutorial/fonts)
- [x] `packages/firestore` — `@ecc/firestore` domain package over the live Firestore project (sections, corpses, likes, admin, legacy drawing adapter)
- [x] Port global CSS (Space Mono, panel/blueprint theme, body pattern)
- [x] Port base components: panel, icon, button, input, loading, radio, date, nav, help, cursor, canvas-panel
- [x] Home page (random corpse + replay animation)
- [ ] Draw flow (picker → random siblings → canvas stack → toolbar → save modal)
- [ ] Gallery (filters by type, sort by date/likes, paging / mobile infinite scroll)
- [ ] Corpse + section detail pages (meta menu: like, permalink, download; related sections/corpses)
- [ ] Admin (password login, make corpse from section, delete section/corpse, update thumb)
- [ ] Netlify config + env docs (Firebase service account, admin password)
- [ ] Verify against live data (needs Firestore credentials / emulator)

## Decisions

- **2026-06-07** — Live data stays in the existing Firebase project (`exquisite-corpse-club`); the SvelteKit server talks to Firestore with `firebase-admin`. atproto moves to a later phase.
- **2026-06-07** — New drawings are stored in `sections.drawing` as canvas-paint `DrawingData`; the reader normalizes the 2020 Vue point-command shape at read time (`Drawing.toDrawingData`).
- **2026-06-07** — Thumbnails stay data URLs in the documents (as in the live app); corpse thumbs are composed server-side with node-canvas at save time.
- **2026-06-07** — Likes are keyed by the existing opaque guest cookie (`ecc_guest_token`) instead of Firebase anonymous-auth UIDs.
- **2026-06-07** — Deploy target is Netlify (SSR functions), not a static SPA: remote functions need a server. Firebase keeps the data.
- **2026-06-07** — Design is a port of the live Nuxt look (SCSS, panels, custom cursor), not the component-library experiment.

## Open questions

- Netlify site + DNS cutover plan (`exquisitecorpse.club` currently on Firebase Hosting).
- Firebase service-account credentials need to be added to 1Password/`.env.schema` refs (names are placeholders).
- Whether to backfill old section documents into canvas-paint data, or keep the read-time adapter indefinitely.

## Context

The repo's default branch (`firebase`) is the live Nuxt 2 + Firestore app at `exquisitecorpse.club`. `atproto` is a ground-up atproto rewrite (SvelteKit + remote functions + canvas-paint) that is kept for later. This branch migrates the live app to SvelteKit first, against the live data, so the atproto data move can happen on top of a working app.
