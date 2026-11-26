# Admin rebuild

**Status:** proposed, not started. Thumbnail strategy decided; cache-purge scope proposed. Updated 2026-11-26.

## Resume here

Nothing is built yet. Next: confirm the purge scope (Decisions, last entry) and answer Open question 2 (hide vs delete). Then start in a new worktree with Phase 3a (server-rendered thumbs), because it changes what Phases 1 and 3 need to do.

## Steps

### Phase 1: make moderation actually work (small, ship first)

- [ ] **Purge the CDN on admin changes.** Since the perf work, public pages are CDN-cached (60 s + stale-while-revalidate) and thumbs are cached for a year. Without a purge, a deleted section can stay visible after an admin deletes it, and its thumb URL keeps working. Add `Netlify-Cache-Tag` headers in `hooks.server.ts` and the `/thumbs` route (`section:<id>`, `corpse:<id>`, `gallery`), and call `purgeCache({ tags })` from `@netlify/functions` after every admin mutation (and after a save, for `gallery`).
- [ ] **Auth hardening.** Reject admin tokens older than 24 h server-side (`isAdmin` currently checks only the signature, so a leaked cookie never expires). Compare the password with `timingSafeEqual`. Add login throttling: both free Netlify rate-limit rules are taken, so count failures per IP in Netlify Blobs and lock for 15 min after 5 failures.
- [ ] **Show what an action will affect before it runs.** "Remove section" also deletes every corpse it's in. Preview the cascade ("this deletes 1 section + 3 corpses") with thumbnails, then confirm.

### Phase 2: browse instead of pasting ids

- [ ] `/admin` becomes a dashboard: counts (the `counts` query already exists but isn't shown), the newest submissions (moderation feed), and a thumb health summary.
- [ ] `/admin/sections` and `/admin/corpses`: paginated grids (cursor-based, `select()`-masked: summaries only), filter by type, artist, hidden and date, search by title/artist prefix, newest first.
- [ ] Detail drawer per item: the drawing rendered from data next to the stored thumb (mismatch is obvious at a glance), metadata, links to the public page, related corpses/sections, and all actions.
- [ ] Multi-select + bulk actions (hide, delete, regenerate thumb) and artist-level actions ("everything by this artist").
- [ ] Keyboard: `j`/`k` move, `h` hide, `r` regenerate, `⌫` delete (with confirm), `/` search.
- [ ] Paste an id or a public URL into search to jump straight to an item (keeps the current workflow fast).

### Phase 3a: server-rendered thumbs (decided 2026-11-26, do first)

- [ ] Spike: canvas-paint `render()` with `@napi-rs/canvas` (prebuilt binaries, no system libs) in a Netlify function. Check output is pixel-identical to browser/node-canvas on the 16-drawing harness (`diff.mjs`-style), and check function bundle size and cold start.
- [ ] `/thumbs/[collection]/[id]` renders from the drawing(s) on a miss: section = its drawing; corpse = its three drawings stacked. Encode WebP at 540px (Image CDN still serves other widths).
- [ ] Persist rendered thumbs in Netlify Blobs keyed by `collection/id/version`, so a deploy (which clears the CDN cache) doesn't mean re-rendering everything. The CDN sits in front, Blobs is the store, and the drawing is the source of truth.
- [ ] Saves stop uploading `thumb`/`corpseThumb` (smaller request; nothing user-supplied is shown as an image). Drop the browser `drawingToThumb`/`corpseToThumb` from the save path.
- [ ] Remove node-canvas, `Drawing.composeThumbs` and the stored `thumb` fields' readers (keep the data until the atproto move; stop writing it).
- [ ] This fixes the striped legacy thumbs automatically: they're re-rendered from drawings.

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
- **2026-11-26**: **proposed purge scope (Martin leans "stale over expensive"):** don't purge pages. They self-heal within ~60 s of the next visit, which is fine for moderation. Purge only on delete/hide, and only that item's thumb tag (`thumb:<collection>:<id>`), because thumbs are cached for a year and would otherwise keep serving at their URL. That's one small targeted call on a rare action; Netlify purges aren't billed. Supersedes Phase 1's "purge on every admin mutation and every save". They're small, and the perf caching made purge a correctness issue for moderation.

## Open questions

1. ~~Where do thumbnails come from?~~ Decided: server-rendered (see Decisions). See the thumbnail discussion in chat (2026-11-26). Options: (a) keep browser-rendered thumbs uploaded with the save, plus admin regenerate/scan (this plan as written); (b) render on the server at save time with a prebuilt canvas (`@napi-rs/canvas`); (c) don't store thumbs at all: the `/thumbs` route renders from the drawing on a cache miss and the CDN keeps it forever. If (c), most of Phase 3 disappears.
2. **Blocking Phase 2: hide vs delete.** Add a `hidden` flag (reversible, keeps history) and filter it out of public queries? Firestore needs every doc to have the field for `where("hidden", "==", false)`, so that's a one-time migration plus composite indexes for each list query. Or keep hard delete only?
3. **Non-blocking:** user-facing "report" button feeding the moderation feed? Small to build, but it needs rate limiting and spam handling.
4. **Non-blocking:** is "reset all likes" still wanted? It's destructive and rarely the right tool; per-item reset may be enough.
5. **Non-blocking:** how much to invest before the atproto move? Phase 1 and the thumbnail decision carry over. The browse UI carries over if it sits on a thin data interface. Firestore-specific hygiene (Phase 4) doesn't.
6. **Non-blocking:** stay password-only, or sign in with atproto OAuth and a DID allowlist once that exists?

## Context

The current `/admin` is one page with id text fields for six actions: make corpse, delete corpse, update corpse thumb, delete section, download paths, reset all likes. There's no way to see what's in the database without opening public pages and copying ids from URLs. Moderation is a real need: offensive names and drawings do show up. Auth is a shared password plus an HMAC-signed cookie (`lib/server/admin.ts`).

Related: `docs/perf-audit.md` items #10 (node-canvas) and #14 (bulk ops) are folded into Phases 3 and 4.
