# Migrate the live Nuxt site to SvelteKit + Firestore

**Status:** in-progress — updated 2026-06-09

## Resume here

Legacy data is confirmed working against the live project (246 sections, all in
the 2020 shape; read-time conversion is enough, no backfill needed). Next:
create the Netlify site, set the Firebase service-account env vars there, then cut
`exquisitecorpse.club` DNS over from Firebase Hosting.

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
- [x] Verify against live Firestore data (ADC with the service account; home/gallery/section render real records)
- [x] Backfill decision: keep the read-time adapter; optional `pnpm convert:drawings` script added
- [x] Reuse the existing Netlify site (`exquisite-corpse-club`, `00f3062d-7e5d-4686-9dda-136bcb1f07d9`); remote Linux builds work, functions bundle, fixture draft verified
- [ ] Rotate the exposed Firebase service-account key; store the fields in 1Password (`firebase-private-key`, `firebase-client-email`) and set Netlify secret env vars from there
- [ ] Production deploy with live data + set the Netlify production branch in the UI
- [ ] DNS cutover

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
- **2026-06-09** — Real-data audit: ~246 sections, every one still in the legacy command-array shape. 1 record is in the mobile-normalized ~1080 space (detected by bounds), 26 have points past the 544×181 panel (left clipped, matching the live renderer). No backfill required.
- **2026-06-09** — Converted data is ~2.5× larger than legacy commands; 6 records would exceed Firestore's 1MiB doc limit after conversion. The converter skips those unless `--force`, and new saves reject drawings over the document budget (413).
- **2026-06-09** — New drawings are capped by serialized size (~900KB with thumb); larger drawings need blob/Storage storage, which the atproto phase would solve with PDS blobs.
- **2026-06-10** — Netlify deploy path: `netlify deploy --remote` (Linux builder) from the repo; the site must have the commit pushed to a branch. `canvas` is imported lazily and corpse thumbs are composed in the browser so the request path has no native dependency. Admin thumb rebuilds still use node-canvas.
- **2026-06-10** — The service-account key was accidentally echoed into a chat/CLI transcript; it must be rotated before the production deploy. Netlify secrets are set from a local file with output suppressed (never `env:import`).

## Open questions

- Netlify site + DNS cutover plan (`exquisitecorpse.club` currently on Firebase Hosting).
- Firebase service-account credentials need real 1Password item names (the `op://` refs in `.env.schema` are placeholders).
- Optional: backfill only sub-limit records with `convert:drawings --write --backup`? Not needed for correctness; keep the adapter.
- Old likes were keyed by Firebase anonymous UIDs. Counts are preserved, but current visitors can't "unlike" someone else's old like (each cookie only toggles its own).

## Context

The repo's default branch (`firebase`) is the live Nuxt 2 + Firestore app at `exquisitecorpse.club`. `atproto` is a ground-up atproto rewrite (SvelteKit + remote functions + canvas-paint) kept for later. This branch migrates the live app to SvelteKit first, against the live data, so the atproto data move can happen on top of a working app.
