# Admin rebuild

**Status:** done: all planned phases shipped and checked in production; the report button is deferred to the atproto version. Updated 2026-11-27.

## Resume here

Everything planned has shipped (Phase 4: `dd0c7ef`) and the production checks passed on 2026-11-27. Click-to-copy ids in /admin shipped the same day (`646a326`). Known bug: the "made corpse …" message never shows, because the item panel remounts when it switches to the new corpse. The report button waits for the atproto version (see Open question 3).

## Steps

### Budget gate (shipped 2026-11-26)

- [x] Site mode `open | read-only | closed` in Netlify Blobs (`site` store), checked in `hooks.server.ts` with a 30 s per-instance cache (`lib/server/site-mode.ts`). The key is `production` for the published deploy and `deploy-<id>` for every other deploy, so drafts can't close the live site. Blobs errors fail open.
  - read-only: `saveDrawing`/`toggleLike` return 503; `/draw` shows a paused message; galleries stay up.
  - closed: every public route returns a plain holding page (`lib/server/closed-page.ts`, 503, `no-store`). `/admin`, `/thumbs`, `/api/budget` and signed-in admins bypass the gate.
- [x] Admin switch: "site mode" panel at the top of `/admin` (`siteMode`/`setSiteMode`). Manual changes are recorded with reason `manual`, and the budget hook never undoes them.
- [x] Budget hook: GCP budget **"exquisite corpse club: read-only gate"** (`billingAccounts/012219-5E8599-AD930F/budgets/327dfa44-…`), $10/month, project `exquisite-corpse-club` only, emails billing admins at 50/90/100%. It publishes to topic `budget-alerts`, and push subscription `budget-gate` (never expires) sends to `https://exquisitecorpse.club/api/budget` with an OIDC token for `budget-push@exquisite-corpse-club.iam.gserviceaccount.com` (Netlify env `BUDGET_PUSH_SERVICE_ACCOUNT`). Spend ≥ budget → read-only (reason `budget`). The first under-budget notification of a *new* budget period reopens it, and only if the budget closed it.
- [x] Verified end-to-end on a draft with a temporary subscription (deleted): unsigned/forged → 401; a fake over-budget message → draft read-only (the "likes refused" result was wrong for real browsers; see the next item), while production stayed open; same-month under-budget → stays read-only; new month → reopens. Production after ship: open, endpoint 401 for unsigned.
- [x] **Fix (shipped 2026-11-27, `7a69ba6`):** read-only never blocked browser saves or likes. The hook matched `event.url`, which for remote commands is the calling page, taken from the client-sent `x-sveltekit-pathname` header; sending `/admin` also got past closed mode, and sending `/gallery` made a per-visitor query CDN-cacheable. Now public writes call `requireWritable()` (`lib/server/writable.ts`) themselves, the hook uses the requested URL, and the save window shows "drawing is paused". Any new public write command must call `requireWritable()`. Verified with a real browser: 13/13 on fixtures (7 fail without the fix); on a draft, saves and likes refused in read-only and a spoofed like refused when closed. Production check (reads only): pages load, and a like-state query claiming `/gallery` stays `private,no-store`.
- To test read-only/closed safely: deploy a draft, then set only that draft's key: `NETLIFY_SITE_ID=00f3062d-7e5d-4686-9dda-136bcb1f07d9 netlify blobs:set site deploy-<id> '{"mode":"read-only","reason":"manual","at":"<ISO>"}' --force`, wait 35 s, and delete the key afterwards. Drafts use live data, so confirm `/draw` says paused before trying any write. **Don't** publish test messages to `budget-alerts`: every subscription receives them, so an over-budget one also pauses production through `budget-gate`.
- To change the amount: `gcloud billing budgets update <name> --budget-amount=…USD`. To disable: delete the `budget-gate` subscription (the budget emails keep working).

### Phase 1: make moderation actually work (small, ship first)

- [x] **Thumb cleanup on delete** (scope as decided: thumbs only, pages self-heal). `forgetThumbs()` in `lib/server/thumbs.ts` deletes every Blobs render under `collection/id/` and calls `purgeCache({ tags: ["thumb:<collection>:<id>"] })` (`@netlify/cache`). It runs from `deleteSection` (the section + every corpse it took with it) and `deleteCorpse`. Best-effort: logged, never fails the delete. Blobs had to be cleared too because `/thumbs` checks Blobs before Firestore. **Not verified on Netlify** (a test delete would remove real data from the shared Firestore). Check after the first real delete: the old thumb URL should 404.
- [x] **Auth hardening.** `isAdmin` rejects tokens older than 24 h (`SESSION_MS`); `checkPassword` compares HMACs with `timingSafeEqual`; login locks an IP for 15 min after 5 failures (`lib/server/login-throttle.ts`, Blobs store `admin-login`, IPs hashed). Verified locally: a 25 h-old signed token redirects to login, a 1 h-old one works; tries 1–5 → 401, try 6 → 429 "too many tries, wait 15 min", even with the right password.
- [x] **Delete preview.** "remove section" and "remove" (corpse) now load a preview (`sectionDeletePreview`/`corpseDeletePreview`) and show the thumbnails of everything that will go ("deletes 1 section + 2 corpses it's in") with delete/cancel, instead of `confirm()`. `Admin.removeSection` is now one batch and returns the deleted corpse ids. Verified locally with fixtures (admin now works in fixtures mode).
- [x] Fixed `vite dev` crashing in the dependency optimizer on the `@napi-rs/canvas` binary (a regression from Phase 3a, only seen when Vite's cache is rebuilt): excluded it from `optimizeDeps` and `ssr.optimizeDeps`.
- [x] Removed `Sections.remove` (unused; admin deletes go through `Admin.*`).
- [x] Shipped 2026-11-26 (`340566c`). Production check: all pages 200, `/admin` → login, thumbs render, a wrong password → 401 through the new lockout path.
- [x] Purge + Blobs cleanup verified 2026-11-27 on the first real hide: section `w95tccvVhR9AMSnwifmc` (cascaded to corpse `ruyyQiuZxIfh2pCh9gUS`), public pages and thumb URLs 404. Left hidden on purpose.

### Phase 2: browse and moderate (hide first, delete second)

- [x] Data: `hidden: boolean` on sections and corpses; corpses also get `hiddenBy` (`manual` or `section:<id>`). Every public read filters hidden: lists/random via `Records.visible()` (`where hidden == false`), `Sections.get`/`Corpses.get` treat hidden as not found unless `{ includeHidden }`, featured-in filters in code. New saves and admin-made corpses write `hidden: false`.
- [x] `Admin.setHidden`: hiding a section hides every visible corpse it's in (`hiddenBy: section:<id>`); unhiding it unhides only those. Hiding runs `forgetThumbs` (Blobs + CDN purge). Pages self-heal within ~60 s (decided purge scope).
- [x] `/thumbs`: hidden → 404 publicly; admins get it rendered with `private, no-store` and it's never written to Blobs, so the Blobs-first lookup can't leak it.
- [x] Admin UI (`routes/admin/`: `+page.svelte`, `browser.svelte`, `item-panel.svelte`, `admin-items.ts`): site mode on top; browser with sections/corpses, all/visible/hidden, newest/likes, type, search (title/artist/id, or a pasted public link); a grid of thumbs (hidden dimmed + badge); multi-select + bulk hide/unhide (≤100 ids per call); keyboard `j/k` move, `enter` open, `x` select, `h` hide/unhide, `/` search, `esc` close. The item panel has meta, related corpses/sections (click to open), artist → filters by artist, public link, hide/unhide, make corpse + download paths (sections), re-render thumb (corpses), delete with preview. Old id-paste forms removed; reset likes + sign out under "tools".
- [x] Browse loads all summaries (`Admin.summaries`, no drawings, ~0.2 KB each) and filters client-side: no index per filter combination. Revisit past a few thousand docs.
- [x] Scripts (`packages/scripts`): `pnpm indexes [db]` (6 composite indexes), `pnpm migrate:hidden [-- --write]` (idempotent, dry run by default), `pnpm copy:database` (prod → named DB, refuses the default). `FIRESTORE_DATABASE_ID` selects a named database in `Client.db()`.
- [x] Verified on fixtures (keyboard hide, cascade, unhide, pasted-link search, bulk) and on **`ecc-staging`** (a copy of production in the same project): indexes built READY; migration 485 updated then 0 on re-run; every public query shape works (gallery corpses/top/mid/bot × date/likes, home random, draw random siblings, section page incl. more-by-artist); hiding real section `5HNVUa4bAsDiTPJkGj5r` → it and its 2 corpses 404 publicly (pages + thumb), gallery drops them, others unaffected; unhide restores. Production untouched throughout (dry run: 485 missing `hidden`).
- [x] **Production rollout** (2026-11-26), in this order: 6 indexes → all 9 READY; migration wrote 485; shipped `21885f3`; re-run wrote 0 (nothing saved in between); `ecc-staging` deleted. Production check: every page 200, gallery corpses/top/mid/bot × date/likes all return items, draw siblings load, no console errors. The steps, for reference:
  1. `pnpm --filter @ecc/scripts indexes` and wait until `gcloud firestore indexes composite list --project=exquisite-corpse-club` shows all READY. Additive; current queries are unaffected.
  2. `pnpm --filter @ecc/scripts migrate:hidden -- --write`. Adds `hidden: false`; the live code ignores it.
  3. Ship (fast-forward `firestore`, push, wait for the deploy).
  4. `pnpm --filter @ecc/scripts migrate:hidden -- --write` again: catches drawings saved by the old code between steps 2 and 3 (they'd be invisible otherwise).
  5. `gcloud firestore databases delete --database=ecc-staging --project=exquisite-corpse-club`.
- [x] Follow-ups: the delete preview marks hidden corpses and the section-picker buttons have accessible names (both in Phase 4). The `report` button is still Open question 3.

### Phase 3a: server-rendered thumbs (decided 2026-11-26, do first)

- [x] Spike: canvas-paint `render()` with `@napi-rs/canvas` 1.2.1. 16 real legacy drawings render in ~33 ms each. Not pixel-identical to Chrome (see Decisions), same class of difference as node-canvas. Linux binary ~36 MB unpacked; bundles fine.
- [x] `/thumbs/[collection]/[id]` renders from the drawing(s): section = its drawing, corpse = its three drawings stacked (`lib/compose.ts` `stack()`, shared with the browser download button). 1080px WebP q85; the Image CDN serves the gallery sizes. Lookup is CDN → Blobs → render; the response header `x-thumb-source: blob|render|stored` says which.
- [x] Rendered thumbs persist in Netlify Blobs (`thumbs` store, key `collection/id/v`), and the CDN keeps them across deploys via `Netlify-Cache-ID: thumb:<collection>:<id>`, which is also the purge tag. URLs are `?v=<RENDER_VERSION>-<thumbVersion>` (`lib/thumbs.ts`).
- [x] Saves no longer upload `thumb`/`corpseThumb` or write a `thumb` field. `rebuildThumb` just bumps `thumbVersion`. `createFromSection` no longer composes.
- [x] node-canvas removed from `app` and `firestore` (`Drawing.composeThumbs` deleted). It's still a dependency of the unused atproto `core` package. The stored `thumb` field is now read only as a fallback when rendering fails (`Thumbs.stored`, short cache).
- [x] Striped legacy thumbs fixed by construction: `5HNVUa4bAsDiTPJkGj5r` and corpse `JQT4p3gLjQ7YuT7WzJxu` render correctly from their drawings on the draft.
- [x] Verified on draft deploys (live data, read-only): gallery 9/9 thumbs, no console errors. Timings: render miss 1.0–2.8 s (includes cold start + Firestore), Blobs hit ~0.46 s, durable-cache hit ~0.33 s, edge hit ~0.14 s.
- [x] Shipped 2026-11-26 (`99d701a`). Production: all gallery thumbs are WebP via the Image CDN; home 0.85 s / corpse 0.69 s warm median after the deploy's cold start (3.9 s first hit).

### Phase 3: thumbnail tools (closed 2026-11-27: superseded by Phase 3a)

Thumbs render from drawings, so there are no stored thumbs to regenerate.

- [x] Not needed: section regenerate, corpse recompose, health scan, legacy backfill. Both known striped corpses (`JQT4p3gLjQ7YuT7WzJxu`, `ktzR92nJQi8UJZxZeS9v`) render correctly in production's render path (the latter checked 2026-11-27).
- [x] Cleanup (done in 3a): `composeThumbs` and node-canvas are gone from `app` and `firestore`; `Corpses.rebuildThumb` only bumps `thumbVersion` ("re-render thumb"). `canvas` remains in the unused atproto `core` package.

### Phase 4: data hygiene and bulk ops

- [x] `Likes.resetAll` reads ids only (`select()`) and writes via `BulkWriter`: no 500-write batch limit, no drawings read. `Admin.clearFeaturedInRefs` deleted (unused). `Admin.removeSection` was already one batch (Phase 1).
- [x] Integrity check (`Integrity.check`, `firestore/src/integrity.ts`): `featuredIn` mismatches (auto-repairable: `Integrity.repair` rewrites each to exactly the corpses that use the section, oldest first), broken corpse panels (missing or wrong-type section; listed, never auto-fixed), sections in no corpse (info). In /admin as "data check" (runs on demand) with "repair references"; ids open in the browser. CLI: `pnpm --filter @ecc/scripts integrity` (read-only).
  - Production at 2026-11-26 (read-only run): 247 sections / 238 corpses; **9 sections list 4 corpses that no longer exist** (harmless: lookups skip missing docs); 0 broken panels; 2 unused sections.
- [x] Audit log (`Audit`, `firestore/src/audit.ts`, collection `adminActions`): every admin mutation is recorded (hide, unhide, delete with cascade, make corpse, re-render thumb, site mode, reset likes, repair refs). Best-effort: a log failure never fails the action. /admin "recent activity" shows the last 50; ids open in the browser; **undo** for hide/unhide (re-applies the opposite through the same path, so cascades and thumb cleanup match), linked both ways (`undoes`/`undoneBy`). Deletes are logged but not undoable.
- [x] Follow-ups from Phase 2: section-picker buttons have `aria-label`s ("draw the top/middle/bottom"); the delete preview marks corpses that are already hidden.
- [x] Verified with fixtures: hide → logged → undo → logged + marked undone; reveal from the log; clean check; a fixture-made mismatch (2 sections) → repair → 0, logged. Draft deploy: public pages + `/admin/login` 200, picker labels present.
- [x] Shipped 2026-11-27 (`dd0c7ef`, fast-forward; no new indexes needed: the audit log only orders by `at`).
- [x] Data check + repair run on production 2026-11-27 (9 sections). Re-check: 248 sections / 239 corpses, 0 mismatches, 0 broken panels, 2 unused sections.

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
3. **Deferred to the atproto version:** user-facing "report" button. Recommendation (2026-11-27):
   - Start with our own queue: the button saves to our database and reports show in `/admin` next to hide. Less to run, works for anonymous visitors, and moderators see the drawings. Needs rate limiting and spam handling.
   - Store each report with the record's URI + CID and an atproto `reasonType`, so it can be forwarded to a labeler later.
   - Add a labeler / [Ozone](https://github.com/bluesky-social/ozone/blob/main/HOSTING.md) only for more moderators or for other apps to respect our decisions. Self-hosting needs its own account and a server with Postgres (2+ GB RAM, 2+ cores recommended).
   - Protocol route: [`com.atproto.moderation.createReport`](https://raw.githubusercontent.com/bluesky-social/atproto/main/lexicons/com/atproto/moderation/createReport.json) with a strongRef subject ([tutorial](https://atproto.com/guides/labels-tutorial)). Requires login and an OAuth scope `rpc:com.atproto.moderation.createReport?aud=<labeler-did>#atproto_labeler`. [Labels](https://atproto.com/specs/label) don't delete records: our app has to hide labelled items, including cached thumbs.
   - Unverified: whether Ozone previews our custom drawing records as pictures.
4. **Non-blocking:** is "reset all likes" still wanted? It's destructive and rarely the right tool; per-item reset may be enough.
5. **Non-blocking:** how much to invest before the atproto move? Phase 1 and the thumbnail decision carry over. The browse UI carries over if it sits on a thin data interface. Firestore-specific hygiene (Phase 4) doesn't.
6. **Non-blocking:** stay password-only, or sign in with atproto OAuth and a DID allowlist once that exists?

## Context

The current `/admin` is one page with id text fields for six actions: make corpse, delete corpse, update corpse thumb, delete section, download paths, reset all likes. There's no way to see what's in the database without opening public pages and copying ids from URLs. Moderation is a real need: offensive names and drawings do show up. Auth is a shared password plus an HMAC-signed cookie (`lib/server/admin.ts`).

The 2026-11-26 performance audit (formerly `docs/perf-audit.md`; full text in git history at `c7528ca`) is finished. Its "#10" and "#14" became Phases 3a and 4.

## Carried over from the perf audit

Production, gzipped HTML, before → after: `/` 322 → 20 KB, `/gallery` 1,418 → 4 KB, corpse 210 → 25 KB, section 292 → 7 KB.

For the atproto version:

- Serve thumbs from a caching route on our domain, keyed by blob: `/thumbs/{did}/{cid}` proxying `com.atproto.sync.getBlob`. The CID replaces `?v=`. Only `lib/thumbs.ts` builds thumb URLs.
- Records must hold real `blob` refs, not CID strings (`CorpseRecordSchema.renderedBlob` at audit time), or the PDS garbage-collects the blob.
- Don't carry the client-uploaded `corpseThumb` over; compose at view time.
- Build pagination around cursors, and make likes records instead of a `likedBy` array. Both were skipped on Firestore.

Don't retry without new evidence:

- Merging legacy path segments changes pixels (0.01–1.85% across 16 drawings) for little size gain.
- Firestore `preferRest` made the 3-drawing corpse page ~2x slower (shipped, then reverted in `02eb67b`). Measure the heaviest read path.
