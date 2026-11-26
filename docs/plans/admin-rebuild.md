# Admin rebuild

**Status:** in-progress: Phases 1 and 3a and the budget gate shipped; Phases 2 and 4 not started. Updated 2026-11-26.

## Resume here

Phase 1 shipped (`340566c`). Open check: after the first real delete in /admin, its old thumb URL should 404 (purge + Blobs cleanup has only run locally). Next: Phase 2, which starts with the `hidden` migration and Firestore indexes. Both change production, so confirm with Martin before running them.

## Steps

### Budget gate (shipped 2026-11-26)

- [x] Site mode `open | read-only | closed` in Netlify Blobs (`site` store), checked in `hooks.server.ts` with a 30 s per-instance cache (`lib/server/site-mode.ts`). The key is `production` for the published deploy and `deploy-<id>` for every other deploy, so drafts can't close the live site. Blobs errors fail open.
  - read-only: `saveDrawing`/`toggleLike` return 503; `/draw` shows a paused message; galleries stay up.
  - closed: every public route returns a plain holding page (`lib/server/closed-page.ts`, 503, `no-store`). `/admin`, `/thumbs`, `/api/budget` and signed-in admins bypass the gate.
- [x] Admin switch: "site mode" panel at the top of `/admin` (`siteMode`/`setSiteMode`). Manual changes are recorded with reason `manual`, and the budget hook never undoes them.
- [x] Budget hook: GCP budget **"exquisite corpse club: read-only gate"** (`billingAccounts/012219-5E8599-AD930F/budgets/327dfa44-…`), $10/month, project `exquisite-corpse-club` only, emails billing admins at 50/90/100%. It publishes to topic `budget-alerts`, and push subscription `budget-gate` (never expires) sends to `https://exquisitecorpse.club/api/budget` with an OIDC token for `budget-push@exquisite-corpse-club.iam.gserviceaccount.com` (Netlify env `BUDGET_PUSH_SERVICE_ACCOUNT`). Spend ≥ budget → read-only (reason `budget`). The first under-budget notification of a *new* budget period reopens it, and only if the budget closed it.
- [x] Verified end-to-end on a draft with a temporary subscription (deleted): unsigned/forged → 401; a fake over-budget message → draft read-only and likes 503, while production stayed open; same-month under-budget → stays read-only; new month → reopens. Production after ship: open, endpoint 401 for unsigned.
- To test again safely: deploy a draft, create a temporary push subscription to `<draft>/api/budget` (same service account), publish `{"costAmount":12,"budgetAmount":10,"costIntervalStart":"<ISO>"}` to `budget-alerts`, then delete the subscription. **Don't** publish an over-budget message while only `budget-gate` exists: that closes production.
- To change the amount: `gcloud billing budgets update <name> --budget-amount=…USD`. To disable: delete the `budget-gate` subscription (the budget emails keep working).

### Phase 1: make moderation actually work (small, ship first)

- [x] **Thumb cleanup on delete** (scope as decided: thumbs only, pages self-heal). `forgetThumbs()` in `lib/server/thumbs.ts` deletes every Blobs render under `collection/id/` and calls `purgeCache({ tags: ["thumb:<collection>:<id>"] })` (`@netlify/cache`). It runs from `deleteSection` (the section + every corpse it took with it) and `deleteCorpse`. Best-effort: logged, never fails the delete. Blobs had to be cleared too because `/thumbs` checks Blobs before Firestore. **Not verified on Netlify** (a test delete would remove real data from the shared Firestore). Check after the first real delete: the old thumb URL should 404.
- [x] **Auth hardening.** `isAdmin` rejects tokens older than 24 h (`SESSION_MS`); `checkPassword` compares HMACs with `timingSafeEqual`; login locks an IP for 15 min after 5 failures (`lib/server/login-throttle.ts`, Blobs store `admin-login`, IPs hashed). Verified locally: a 25 h-old signed token redirects to login, a 1 h-old one works; tries 1–5 → 401, try 6 → 429 "too many tries, wait 15 min", even with the right password.
- [x] **Delete preview.** "remove section" and "remove" (corpse) now load a preview (`sectionDeletePreview`/`corpseDeletePreview`) and show the thumbnails of everything that will go ("deletes 1 section + 2 corpses it's in") with delete/cancel, instead of `confirm()`. `Admin.removeSection` is now one batch and returns the deleted corpse ids. Verified locally with fixtures (admin now works in fixtures mode).
- [x] Fixed `vite dev` crashing in the dependency optimizer on the `@napi-rs/canvas` binary (a regression from Phase 3a, only seen when Vite's cache is rebuilt): excluded it from `optimizeDeps` and `ssr.optimizeDeps`.
- [x] Removed `Sections.remove` (unused; admin deletes go through `Admin.*`).
- [x] Shipped 2026-11-26 (`340566c`). Production check: all pages 200, `/admin` → login, thumbs render, a wrong password → 401 through the new lockout path.
- [ ] Verify purge + Blobs cleanup on the first real delete.

### Phase 2: browse instead of pasting ids

- [ ] `/admin` becomes a dashboard: counts (the `counts` query already exists but isn't shown), the newest submissions (moderation feed), and a thumb health summary.
- [ ] `/admin/sections` and `/admin/corpses`: paginated grids (cursor-based, `select()`-masked: summaries only), filter by type, artist, hidden and date, search by title/artist prefix, newest first.
- [ ] Detail drawer per item: the drawing rendered from data next to the stored thumb (mismatch is obvious at a glance), metadata, links to the public page, related corpses/sections, and all actions.
- [ ] Multi-select + bulk actions (hide, delete, regenerate thumb) and artist-level actions ("everything by this artist").
- [ ] Keyboard: `j`/`k` move, `h` hide, `r` regenerate, `⌫` delete (with confirm), `/` search.
- [ ] Paste an id or a public URL into search to jump straight to an item (keeps the current workflow fast).

### Phase 3a: server-rendered thumbs (decided 2026-11-26, do first)

- [x] Spike: canvas-paint `render()` with `@napi-rs/canvas` 1.2.1. 16 real legacy drawings render in ~33 ms each. Not pixel-identical to Chrome (see Decisions), same class of difference as node-canvas. Linux binary ~36 MB unpacked; bundles fine.
- [x] `/thumbs/[collection]/[id]` renders from the drawing(s): section = its drawing, corpse = its three drawings stacked (`lib/compose.ts` `stack()`, shared with the browser download button). 1080px WebP q85; the Image CDN serves the gallery sizes. Lookup is CDN → Blobs → render; the response header `x-thumb-source: blob|render|stored` says which.
- [x] Rendered thumbs persist in Netlify Blobs (`thumbs` store, key `collection/id/v`), and the CDN keeps them across deploys via `Netlify-Cache-ID: thumb:<collection>:<id>`, which is also the purge tag. URLs are `?v=<RENDER_VERSION>-<thumbVersion>` (`lib/thumbs.ts`).
- [x] Saves no longer upload `thumb`/`corpseThumb` or write a `thumb` field. `rebuildThumb` just bumps `thumbVersion`. `createFromSection` no longer composes.
- [x] node-canvas removed from `app` and `firestore` (`Drawing.composeThumbs` deleted). It's still a dependency of the unused atproto `core` package. The stored `thumb` field is now read only as a fallback when rendering fails (`Thumbs.stored`, short cache).
- [x] Striped legacy thumbs fixed by construction: `5HNVUa4bAsDiTPJkGj5r` and corpse `JQT4p3gLjQ7YuT7WzJxu` render correctly from their drawings on the draft.
- [x] Verified on draft deploys (live data, read-only): gallery 9/9 thumbs, no console errors. Timings: render miss 1.0–2.8 s (includes cold start + Firestore), Blobs hit ~0.46 s, durable-cache hit ~0.33 s, edge hit ~0.14 s.
- [x] Shipped 2026-11-26 (`99d701a`). Production: all gallery thumbs are WebP via the Image CDN; home 0.85 s / corpse 0.69 s warm median after the deploy's cold start (3.9 s first hit).

### Phase 3: thumbnail tools (replaces the node-canvas admin paths, audit #10)

- [ ] **Regenerate section thumb from its drawing** in the browser (`drawingToThumb`, 540px WebP), and bump `thumbVersion` on sections too (only corpses bump it today). This is the fix for the striped thumbs: `5HNVUa4bAsDiTPJkGj5r`'s stored thumb is stripes while its drawing is fine, so "update thumb" on a corpse, which restacks section thumbs, can't fix it.
- [ ] **Recompose corpse thumb from the three drawings** (`corpseToThumb`), not from section thumbs.
- [ ] **Health scan:** for each section, render the drawing at ~64px, decode the stored thumb at the same size, and flag large differences (broken, striped, blank, mismatched). Runs in the browser in batches; results are listed with one-click regenerate.
- [ ] **Backfill job:** regenerate every legacy 1080px PNG thumb as 540px WebP (247 sections + 238 corpses at time of writing). Client-driven chunks of ~10 ids per command, so no request gets near Netlify's function timeout. Resumable (skips items whose `thumbVersion` is newer than the job start) with a progress bar and pause. Afterwards the Image CDN step in `lib/thumbs.ts` becomes optional.
- [ ] Then delete `Drawing.composeThumbs`, `Corpses.rebuildThumb`'s server path, and the `canvas` dependency (audit #10).

### Phase 4: data hygiene and bulk ops

- [ ] Rewrite `Likes.resetAll` and `Admin.clearFeaturedInRefs`: today they read every full document (drawings included) and put all writes in one batch, which fails past 500 docs (we have 247/238, so not yet). Use `.select()` with no fields plus `BulkWriter`, client-driven in chunks like the backfill. Or drop "reset all likes" (Open question 4).
- [ ] `Admin.removeSection` deletes its corpses one at a time; make it one batch (≤500 ops is plenty here).
- [ ] Integrity check: corpses pointing at missing sections, `featuredIn` refs to missing corpses, sections with no corpse. List them, with fix-up actions.
- [ ] Audit log: an `adminActions` collection (`{ at, action, ids, before? }`), shown on the dashboard, with undo for hide/unhide and thumb regenerations (keep the previous thumb in `before`).

## Decisions

- **2026-11-26**: plan only, written after the perf round; nothing implemented. Sized for the real data (247 sections / 238 corpses), so client-driven chunked jobs are simpler than background workers or queues.
- **2026-11-26**: phase order puts cache purge + auth first.
- **2026-11-26**: **thumbnail strategy = render on the server from the drawing** (Open question 1, option c). It removes the client-trust gap (saves could upload any image as a thumb), broken stored thumbs, backfills and node-canvas, and it's the right shape for atproto, where the drawing record is the source of truth. Stored in Netlify Blobs + CDN (Phase 3a). Most of Phase 3's regenerate/scan/backfill tooling becomes unnecessary; keep only "re-render this item" (bump version + purge).
- **2026-11-26**: purge scope below confirmed by Martin ("great, continue").
- **2026-11-26**: **proposed purge scope (Martin leans "stale over expensive"):** don't purge pages. They self-heal within ~60 s of the next visit, which is fine for moderation. Purge only on delete/hide, and only that item's thumb tag (`thumb:<collection>:<id>`), because thumbs are cached for a year and would otherwise keep serving at their URL. That's one small targeted call on a rare action; Netlify purges aren't billed. Supersedes Phase 1's "purge on every admin mutation and every save". They're small, and the perf caching made purge a correctness issue for moderation.
- **2026-11-26**: server thumbs are not pixel-identical to the browser, and can't be: Skia (napi) vs Chrome differ in 0.6–9.6% of pixels across the 16 drawings, almost all anti-aliasing (pixels off by >64/255: 0.01–0.6%). node-canvas (Cairo) differs from Chrome by about the same (0.6–8.2%). Accepted: thumbnails are previews. The at-rest artwork on corpse/section pages is still rendered in the visitor's browser, and the download is still rendered in the browser.
- **2026-11-26**: thumbs render at 1080px, not 540, because they're also the link-preview image; the Image CDN downsizes for the gallery.
- **2026-11-26**: Blobs store is site-wide, so previews share it with production. Safe because keys include the render version and the content depends only on data. Rule: any rendering change must bump `RENDER_VERSION` (comment in `lib/server/thumbs.ts`).
- **2026-11-26**: budget gate: Martin chose $10/month, emails at 50/90/100%, and automatic reopening next month. The push goes straight to the app (no Cloud Function), verified by Google's OIDC token with the request URL as audience. Netlify itself (free plan) can still pause the site if its own allowance runs out; nothing in-app can cover that.
- **2026-11-26**: **hide vs delete (Open question 2): hide is the main moderation action, delete is the second option.** Hiding needs a `hidden` field on every doc (Firestore can only filter on fields that exist), so Phase 2 starts with a one-off migration setting `hidden: false` on all 485 docs, plus composite indexes for each public list query and the random pickers. Hiding should also call `forgetThumbs()`.

## Open questions

1. ~~Where do thumbnails come from?~~ Decided: server-rendered (see Decisions). See the thumbnail discussion in chat (2026-11-26). Options: (a) keep browser-rendered thumbs uploaded with the save, plus admin regenerate/scan (this plan as written); (b) render on the server at save time with a prebuilt canvas (`@napi-rs/canvas`); (c) don't store thumbs at all: the `/thumbs` route renders from the drawing on a cache miss and the CDN keeps it forever. If (c), most of Phase 3 disappears.
2. ~~Hide vs delete?~~ Decided: hide first, delete second (see Decisions). Original question: Add a `hidden` flag (reversible, keeps history) and filter it out of public queries? Firestore needs every doc to have the field for `where("hidden", "==", false)`, so that's a one-time migration plus composite indexes for each list query. Or keep hard delete only?
3. **Non-blocking:** user-facing "report" button feeding the moderation feed? Small to build, but it needs rate limiting and spam handling.
4. **Non-blocking:** is "reset all likes" still wanted? It's destructive and rarely the right tool; per-item reset may be enough.
5. **Non-blocking:** how much to invest before the atproto move? Phase 1 and the thumbnail decision carry over. The browse UI carries over if it sits on a thin data interface. Firestore-specific hygiene (Phase 4) doesn't.
6. **Non-blocking:** stay password-only, or sign in with atproto OAuth and a DID allowlist once that exists?

## Context

The current `/admin` is one page with id text fields for six actions: make corpse, delete corpse, update corpse thumb, delete section, download paths, reset all likes. There's no way to see what's in the database without opening public pages and copying ids from URLs. Moderation is a real need: offensive names and drawings do show up. Auth is a shared password plus an HMAC-signed cookie (`lib/server/admin.ts`).

Related: `docs/perf-audit.md` items #10 (node-canvas) and #14 (bulk ops) are folded into Phases 3 and 4.
