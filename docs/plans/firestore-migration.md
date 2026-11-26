# Migrate the live Nuxt site to SvelteKit + Firestore

**Status:** in-progress — updated 2026-06-08

## Resume here

Verify against real Firestore data (needs service-account credentials or the
emulator): create the Netlify site, then cut `exquisitecorpse.club` DNS over from
Firebase Hosting. Ported screens are all rendering from `ECC_FIXTURES=1`; admin
login/make-corpse works, likes and pagination work.

## Steps

- [x] Push `atproto` to origin so the rewrite work is safe
- [x] Branch `firestore` from `atproto`; prune atproto routes, auth and the component-library experiment
- [x] Add `@sveltejs/adapter-netlify`, `sass`, ported static assets (icons/cursor/tutorial/fonts)
- [x] `packages/firestore` — `@ecc/firestore` domain package over the live Firestore project (sections, corpses, likes, admin, legacy drawing adapter)
- [x] Port global CSS (Space Mono, panel/blueprint theme, body pattern)
- [x] Port base components: panel, icon, button, input, loading, radio, date, nav, help, cursor, canvas-panel
- [x] Home page (random corpse + replay animation)
- [x] Draw flow (picker → random siblings → canvas stack → toolbar → save modal)
- [x] Gallery (filters by type, sort date/likes, paging / mobile infinite scroll)
- [x] Corpse + section detail pages (like, permalink, download; related grids)
- [x] Admin (password login, make corpse from section, delete section/corpse, update thumb, reset likes, export paths)
- [x] Fixture mode (`ECC_FIXTURES=1`) for developing without credentials
- [x] Netlify config + env docs (`netlify.toml`, `.env.schema`, README, app CLAUDE.md)
- [ ] Verify against live Firestore data and compare counts/content with the Nuxt app
- [ ] Deploy to Netlify + DNS cutover
- [ ] Backfill decision: keep the read-time legacy adapter or rewrite old `drawing` docs

## Decisions

- **2026-06-07** — Live data stays in the existing Firebase project (`exquisite-corpse-club`); the SvelteKit server talks to Firestore with `firebase-admin`. atproto moves to a later phase.
- **2026-06-07** — New drawings are stored in `sections.drawing` as canvas-paint `DrawingData`; the reader normalizes the 2020 Vue point-command shape at read time (`Drawing.toDrawingData`).
- **2026-06-07** — Thumbnails stay data URLs in the documents (as in the live app); corpse thumbs are composed server-side with node-canvas at save time.
- **2026-06-07** — Likes are keyed by the existing opaque guest cookie (`ecc_guest_token`) instead of Firebase anonymous-auth UIDs.
- **2026-06-07** — Deploy target is Netlify (SSR functions), not a static SPA: remote functions need a server. Firebase keeps the data.
- **2026-06-07** — Design is a port of the live Nuxt look (SCSS, panels, custom cursor), not the component-library experiment.
- **2026-06-08** — SSR data uses `$derived(await query(...))` without a `pending` boundary; Svelte renders only the `pending` snippet on the server. Boundaries are kept for client-loaded UI only.
- **2026-06-08** — canvas-paint is imported dynamically in the browser (`document` at import time) and `Paint` is re-fitted after creation because it measures at document width before CSS applies.
- **2026-06-08** — `ECC_FIXTURES=1` fixture mode added for reviewing the UI before Firebase credentials are available.

## Open questions

- Netlify site + DNS cutover plan (`exquisitecorpse.club` currently on Firebase Hosting).
- Firebase service-account credentials need real 1Password item names (the `op://` refs in `.env.schema` are placeholders).
- Whether to backfill old section documents into canvas-paint data, or keep the read-time adapter indefinitely.

## Context

The repo's default branch (`firebase`) is the live Nuxt 2 + Firestore app at `exquisitecorpse.club`. `atproto` is a ground-up atproto rewrite (SvelteKit + remote functions + canvas-paint) kept for later. This branch migrates the live app to SvelteKit first, against the live data, so the atproto data move can happen on top of a working app.
