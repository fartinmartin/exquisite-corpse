# Performance audit — 2026-11-26 (`firestore` branch)

**Status:** in-progress: #1–#8 done and committed on `perf/audit-fixes` (worktree `../exquisite-corpse-perf`); needs a deploy preview. Updated 2026-11-26.

## Resume here

Push `perf/audit-fixes` and open a Netlify deploy preview (it's an outward-facing step, so it's left for Martin). On the preview, check the two Netlify-only items under Open questions. If `/.netlify/images?url=/thumbs/...` fails, set `__NETLIFY_IMAGE_CDN__` to `false` in `packages/app/vite.config.ts`. After that, the remaining audit items are #9–#16 below. #10 (drop node-canvas) is the natural next one: corpse thumbs now always come from the browser, so only the admin `rebuildThumb`/`createFromSection` still need it.

## Steps

- [x] #3 `select()`/`fieldMask` on every read; legacy drawing conversion only when the drawing is read (`records.ts`: `toSection` vs `toSectionWithDrawing`)
- [x] #4 section page = 2 round trips (`Sections.detail`), corpse page = 2 (`Corpses.get`). Removed both `+page.server.ts` loads (head tags now come from the query result). `getSiblings` runs in parallel.
- [x] #1 summaries carry `thumbVersion` instead of image data; `/thumbs/[collection]/[id]?v=` serves bytes with `immutable` caching (`routes/thumbs/.../+server.ts`, `Thumbs.get`); `rebuildThumb` bumps `thumbVersion`
- [x] #2 new thumbs are 540px WebP (JPEG on Safari), rendered from drawings (`render.ts`: `drawingToThumb`, `corpseToThumb`). Legacy thumbs go through Netlify Image CDN with `srcset` (`lib/thumbs.ts`, enabled when `NETLIFY=true` at build). Download renders a 1080px PNG from the drawings (`drawingsToPng`). Gallery `<img>` have width/height, lazy below the first 9.
- [x] #6 home/corpse/draw payloads have no thumb data (falls out of #1); draw page composes the corpse thumb from drawings, not sibling thumbs
- [x] #5 `hooks.server.ts`: CDN cache headers (60s + SWR) on `/gallery`, section/corpse pages and their remote queries; guest handle cookie only on `/draw`; guest token issued by `toggleLike`; like state is a separate client-only `getLikeState` query (`like-button.svelte`); `netlify.toml` caches `/fonts` and `/img`
- [x] #7 **rejected path merging** (pixel diff below); kept the lazy-conversion part (#3)
- [x] #8 `render.ts` `replay()`: paints only new paths per rAF frame onto one canvas (via `paintOnto`), aborts on unmount, skips under reduced motion; `canvas-panel.svelte` re-blits the cached render on resize
- [x] smoke test with fixtures (`ECC_FIXTURES=1 npx vite dev`). Covered: every page 200 with no `data:image` thumbs in HTML; unknown ids 404; `/thumbs` immutable; cookie only on `/draw`; like toggle persists across reload; download gives a 1080px PNG; draw → save produced a 540×540 WebP corpse thumb (11 KB) and section thumb (3.7 KB); no console errors. `pnpm check` clean; `NETLIFY=true vite build` OK.
- [x] committed (one code commit: the type change from thumb data to `thumbVersion` couples the data layer, pages and like button, so they don't split into commits that each compile)
- [ ] deploy preview: verify Image CDN + CDN caching (Open questions)
- [ ] after merge: compare against the "Measurements" table (gallery HTML was 1.4 MB gzipped)

## Decisions

- **2026-11-26**: kept the progress log in this file (the user asked for it here) instead of `docs/plans/`.
- **2026-11-26**: #8 incremental replay verified pixel-identical to a full `render()`. Test: 16 real legacy drawings scraped from the live home page, node-canvas, random uneven chunks, 0 differing pixels in every one. Script: `diff.mjs` in the session scratchpad. It's a node-canvas harness around `canvas-paint/render`; re-create it if needed.
- **2026-11-26**: #7 merging contiguous legacy segments into one polyline is **not** pixel-identical. Separate strokes double-composite their anti-aliased edges at every joint; one polyline doesn't. Across the same 16 drawings: 0.01–1.85% of pixels change, by up to 169/255. Size savings were only 1–6% for 12 of 16 drawings (37–43% for the other 4). Per the "keep at-rest fidelity" rule, not shipped. Gzip already removes most of the repetition (home: 1 MB raw → 322 KB).
- **2026-11-26**: like state moved out of page data into `getLikeState` (browser-only `$effect`) so the cached HTML/query responses have no per-visitor data. Trade-off: one small extra request per detail page, and the heart fills in after hydration.
- **2026-11-26**: thumbs live at `/thumbs/...`, not `/img/...`, because `static/img` already holds icons.
- **2026-11-26**: `paintOnto` feeds our canvas to canvas-paint's `render()` via `createCanvas` and swallows its initial background `fillRect`, because `drawPathToContext` isn't exported from `@fartinmartin/canvas-paint/render`. That's a hack that depends on render internals (commented in code). Proper fix: export it from canvas-paint.

## Open questions

- **Non-blocking, verify on a deploy preview:** does Netlify Image CDN accept a function-served source (`/.netlify/images?url=/thumbs/...`)? If not, set `__NETLIFY_IMAGE_CDN__` to false in `vite.config.ts` and legacy thumbs are served full-size (still cached, no longer inlined).
- **Non-blocking, verify on a deploy preview:** does Netlify's CDN honour `netlify-cdn-cache-control` on the SSR function and remote query responses? Look for `cache-status: "Netlify Edge"; hit` on a second request.
- **Non-blocking:** export `drawPathToContext` from canvas-paint (your package, needs a publish) so `paintOnto` can drop the Proxy.
- **Non-blocking, found while testing:** `app.html` has a static `<title>`/description *before* `%sveltekit.head%`, so SSR'd pages have two titles and crawlers/link previews see the generic one. Not perf, so not fixed here; predates this branch.
- **Non-blocking:** backfill legacy 1080px PNG thumbs to small WebP? It writes production data, so I didn't do it. The Image CDN covers display in the meantime.

---

Scope: `packages/app` (SvelteKit on Netlify) + `packages/firestore`. I read the code and measured the live site (`exquisitecorpse.club`) with `curl`. Each finding is tagged:

- **[carries over]**: the same problem will exist after the atproto migration unless it's designed out. Worth fixing now, or at least keeping in mind for the new design.
- **[firestore-only]**: goes away with the migration. Fix only if it's cheap or hurting users today.

## Measurements (live, warm, from one location)

| Page | HTML (raw) | HTML (gzip) | Inlined `data:image` bytes | TTFB |
|---|---|---|---|---|
| `/` | 1,006 KB | 322 KB | 108 KB (4 thumbs, none displayed) | ~0.9–1.8 s |
| `/gallery` | 2,037 KB | **1,418 KB** | **2,024 KB** (18 = 9 thumbs × 2) | ~0.8 s |
| `/gallery/corpse/:id` | 677 KB | 210 KB | 255 KB | ~1.4 s |
| `/gallery/section/:id` | 594 KB | 292 KB | 535 KB | ~1.0 s |

All responses come back `cache-control: no-cache` with `cache-status: fwd=miss`, so every view runs the function and Firestore again. Base64 PNG barely compresses, which is why the gallery's gzip size stays at 1.4 MB.

---

## P0 — biggest wins

### 1. Thumbnails are base64 data URLs embedded in HTML/JSON  [carries over]
`thumb` is stored as a PNG data URL (`sections.ts:257`, `corpses.ts:168`) and passed straight into `<img src>` (`gallery-grid.svelte:60`, `section/[id]/+page.svelte:81,96`).

Effects:
- **Every gallery thumb ships twice.** It appears once in the SSR'd `<img src>` and once in the serialized remote-query payload used for hydration. That's 9 corpse thumbs → 2 MB of HTML.
- None of it can be cached. Browser, CDN and HTTP caches never see an image URL, so every page view and every pagination click downloads the same bytes again.
- `loading="lazy"`, `srcset` and `decoding="async"` can't help. The bytes are already in the document before the browser parses the `<img>`.
- The data passes through Firestore → function memory → JSON → HTML on every request. That inflates function time and response size (Netlify caps function responses at 6 MB).

Fix: serve images from a URL and put only the URL in the data. For example, add a `/img/[collection]/[id].png` endpoint (or `.webp`) that reads the thumb, decodes the base64 once and returns bytes with `cache-control: public, max-age=31536000, immutable`. Put a version/hash in the URL, because rebuilding a thumb changes it. List and detail payloads then carry a ~60-byte URL instead of 25–130 KB.

**Why fix it now:** atproto blobs are served by URL too (PDS `getBlob`, or a CDN/image proxy in front of it). If the UI already handles "thumb is a URL" plus a caching proxy route, the migration only swaps that route's backend.

### 2. Thumbnails are oversized for how they're displayed  [carries over]
- Section thumbs are rendered at 1080×360 (`render.ts:83-87`), and corpse thumbs at 1080×1080 (`render.ts:90`). The gallery shows them at ~172 px wide (`516px / 3`).
- They're PNG, between 24 and 128 KB each in the measured pages.

Fix: generate a small display thumb (e.g. 360 px wide, ×2 for DPR → ~540 px) as WebP or JPEG at ~0.8 quality, typically 5–15 KB. Keep the full-res render only for the download button. That button could also render from `drawing` on demand and drop the need for a full-res stored image (`download-button.svelte`). Add `width`/`height` attributes and `loading="lazy"` to gallery `<img>` tags (prevents layout shift, and below-the-fold mobile items load later).

### 3. Firestore list queries download full documents, including drawings  [firestore-only, but cheap]
`Sections.list`, `Corpses.list`, `moreByArtist`, `featuredIn` and `randomSnapshot` all fetch whole documents. A section doc holds `drawing` (up to ~900 KB), `thumb`, and an unbounded `likedBy` array. Then `sectionToRecord` runs `Drawing.toDrawingData()` (legacy conversion) on every row, and `sectionToSummary` throws the result away (`records.ts:72,76-78`).

So one sections gallery page pulls up to 21 full drawings from Firestore, converts them, and discards them.

Fix: add `.select("type","title","artist","date","likes","thumb","featuredIn")` to list/summary queries. Make the drawing conversion lazy, or put it in a separate `sectionToRecordWithDrawing`. If #1 lands, `thumb` can also come out of list projections.

### 4. Redundant sequential reads on detail pages  [carries over: same pattern will exist against PDS/AppView]
**Section page** (`/gallery/section/:id`) reads the same section doc **4 times**, and each read pulls the full drawing and thumb:
1. `+page.server.ts` load → `Sections.get(id)` (for `<title>`)
2. `getSection` → `Sections.get(id)`
3. `Sections.featuredIn(id)` → reads the section again just to get `featuredIn`, which (2) already had (`sections.ts:146`)
4. `Likes.state` → reads it again for `likes` and `likedBy` (`likes.ts:73`), and only **after** the `Promise.all`, so it's another sequential round trip

The minimum is one read for the section, then `getAll` for corpses ‖ the artist query. That's 2 round trips instead of ~5.

**Corpse page**: the load function calls `Corpses.get` (1 corpse read + 3 sections via `getAll`). Then `getCorpse` does it all again, plus `Likes.state` re-reads the corpse. That's 3 sequential steps duplicated, plus one more.

Fix: compute like state from the snapshot you already have (`likedBy.includes(liker)`). Drop the load function and put `<svelte:head>` data on the remote query result, or have the load reuse the query. Either way, one fetch per page.

**Draw page**: `getSiblings` fetches the two random siblings **sequentially** in a `for … await` loop (`draw.remote.ts:29`), and `randomSnapshot` can take 2 sequential queries each. Use `Promise.all`.

**Home**: `randomSnapshot` → `getAll(sections)` is inherently 2 round trips. Fine, but see #6 for what it returns.

### 5. No caching anywhere  [carries over]
Every route is SSR'd with `no-cache`. `hooks.server.ts` sets cookies on first visit, so those responses can't be shared-cached either.

- Gallery lists and section/corpse bodies are the same for everyone, apart from `liked`. Split per-user like state into its own tiny query, or a client-side fetch after hydration. The public part can then get `cache-control: public, s-maxage=60, stale-while-revalidate=600` (Netlify CDN honours this). Verify that remote `query` responses let you `setHeaders` via `getRequestEvent()`; if not, use a `+server.ts` JSON endpoint for public lists.
- Issue the guest cookie lazily: only when someone likes or saves, not on every first page view. Otherwise first-visit responses always carry `Set-Cookie`.
- Static assets under `/_app/immutable` are already immutable-cached by the adapter. Make sure `/fonts` and `/img` get long cache headers too, via `netlify.toml` `[[headers]]`.

---

## P1 — meaningful

### 6. Home page ships ~900 KB of drawing JSON plus unused thumbs  [carries over]
`randomCorpse` returns 3 full `SectionWithDrawing` panels. Each also includes `thumb` and `featuredIn`, which the home page never uses. Legacy drawings are especially bloated (see #7). The HTML is 1 MB raw and 322 KB gzipped, and the replay can't start until all of it has parsed and hydrated.

Options:
- Paint the corpse thumb image first (cached URL, instant LCP). Then fetch the drawings after hydration and run the replay over the image.
- At minimum, strip `thumb`/`featuredIn`/`likedBy` from panel payloads where they aren't used: home, corpse page and draw-page siblings. Only `MetaMenu`'s download needs a thumb.

### 7. Legacy drawings: one Path per 2-point segment  [carries over if legacy data is migrated as-is]
`Drawing.toDrawingData` turns every legacy command into its own `Path` (`drawing.ts:64-67`). A typical old drawing becomes thousands of 1–2 point paths with repeated `color/size/cap/join/tolerance`. That causes:
- large JSON (the home page had ~7,600 `points` keys for 3 panels)
- one `beginPath/stroke` per segment in the renderer, which is slow, especially multiplied by the replay (#8)
- conversion CPU on **every read**, including list rows where the result is thrown away (#3)

Fix: merge consecutive segments with the same mode/colour/size, where `prev.to == next.from`, into a single polyline path. Do it **once**: write the converted data back, or do it in the atproto migration script (`packages/scripts/src/convert-legacy-drawings.ts`) so records go into the PDS already compact. Rounding coordinates to integers (or 1 decimal) also shrinks the payload a lot.

### 8. Replay animation is O(frames × paths), with flood fills redone each frame  [carries over]
`drawReplay` (`render.ts:138-163`) re-renders the drawing from scratch up to 40 times, and each `render()` creates a fresh canvas and replays every path so far. That's ~20× the cost of a single render, × 3 panels on home and corpse pages. `fill` paths use `getImageData` flood fill, so legacy drawings with fills pay that again on every frame.

Fix: render incrementally. Keep one offscreen canvas, draw only paths `[prevUpto, upto)` onto it each frame, then blit. Use `requestAnimationFrame` instead of `setTimeout`. This needs canvas-paint to expose a "render paths into an existing context" API (it's your package). Also skip the replay under `prefers-reduced-motion`.

Also in `canvas-panel.svelte:91-95`: the `ResizeObserver` callback re-runs a full `drawStatic` on every resize event with no rAF throttling. Cache the full-res rendered canvas once and just `drawImage` it scaled on resize.

### 9. Save request uploads ~3 images worth of base64  [carries over in shape]
`saveDrawing` sends `drawing` + `thumb` (≤600 KB) + `corpseThumb` (≤1 MB) as base64 in a JSON body (`draw/+page.svelte:80-88`). `getSiblings` already sent both sibling drawings **and** thumbs down just so the client can merge thumbs.

The server then re-reads both sibling docs in full (`sections.ts:211`) only to check their type and read title/thumb. When `corpseThumb` is provided, the thumb isn't needed, so a `.select("type","title")` read is enough.

With atproto: blobs are uploaded as binary (`uploadBlob`, ~33% smaller than base64), and a corpse can reference three section blobs instead of storing a pre-composed image. The composite can be produced at view time by the image route from #1. Plan for that, and don't carry `corpseThumb` into the new design.

### 10. node-canvas in the server bundle  [firestore-only]
`canvas` (19 MB native addon) is a dependency of both `@ecc/app` and `@ecc/firestore`. `Drawing.composeThumbs` imports it dynamically, and `Corpses.rebuildThumb`, `createFromSection` and the `Sections.save` fallback all use it. The Netlify function's file tracer will likely bundle the native binary. That inflates function size and cold-start time, and the comments already say it may not load on Netlify at all.

Fix: make `corpseThumb` required on save. Move the admin "rebuild thumb" and "make corpse" composition into the browser (`mergeThumbs` already exists). Then drop `canvas` from both packages.

### 11. firebase-admin cold start  [firestore-only]
`firebase-admin/firestore` loads gRPC by default, which is slow to initialise in serverless functions. `instance.settings({ preferRest: true, ignoreUndefinedProperties: true })` in `client.ts:115` makes most reads use HTTP/REST and noticeably cuts cold-start time. Also check that the Netlify function region is near the Firestore region. A ~1 s warm TTFB for 2–5 small reads suggests cross-region round trips. Set the function region in Netlify site settings to match.

---

## P2 — smaller / correctness-adjacent

### 12. Offset pagination  [firestore-only]
`Records.paginate` uses `.offset(n)` (`records.ts:155`). Firestore bills (and spends time on) every skipped doc, so page 10 of sections reads ~230 docs. Use cursor pagination (`startAfter(lastDate, lastId)`) and pass an opaque cursor to the client. The atproto equivalent (`listRecords` / AppView cursors) is cursor-based anyway, so building the UI around cursors now carries over. **[UI part carries over]**

### 13. `likedBy` arrays grow without bound inside the main doc  [firestore-only]
Every read of a popular section or corpse transfers its full `likedBy` list, and it counts toward the 1 MiB doc limit alongside the drawing. The like transaction also reads the whole doc (drawing included) for every like. Move likes to a subcollection (`likes/{liker}`) plus a counter, or at least `select()` in `Likes.state`. With atproto, likes become records with a backlink/AppView count, so don't sink much time into this.

### 14. Admin bulk ops read every document in full and exceed batch limits  [firestore-only]
`Likes.resetAll` and `Admin.clearFeaturedInRefs` call `.get()` on whole collections, pulling every drawing and thumb, then put all updates into **one** `WriteBatch`. Batches max out at 500 writes, so these fail once a collection has more than 500 docs. Use `.select()` (no fields) plus `BulkWriter`. `Admin.removeSection` deletes corpses sequentially in a loop; it could use `Promise.all` or a single batch.

### 15. Gallery filter/sort change fires a wasted request  [carries over]
`gallery/+page.svelte:32-36` resets `page = 0` in an `$effect`. That runs after the `{#key}` block has already remounted `GalleryGrid` with the old `page`, so changing filter while on page 3 queries page 3 and then page 0. Reset `page` in the `onselect` handlers instead. Also consider keeping filter/sort/page in the URL (`?filter=top&page=2`) so pages are linkable and cacheable (#5).

### 16. Minor client bits  [carries over]
- `cursor.svelte:68`: reads `tooltipEl.offsetWidth` on every `mousemove` while a tooltip is visible, forcing layout. Measure once when the tooltip text changes.
- `draw/+page.svelte:101`: `{@const drawing = drawState.paint.save()}` serialises the entire drawing in the template. It re-runs whenever reactive deps change while the modal is open. Compute it once when opening the modal.
- Fonts: two woff2 files (32 KB each) with `font-display: swap`, which is fine. Add `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the regular weight to avoid a reflow. The `.woff` fallbacks are unnecessary for any current browser.

---

## Suggested order

1. **#1 + #2** (image URLs + small WebP thumbs): biggest user-visible win, shapes the atproto design.
2. **#4** (collapse duplicate reads) and **#3** (`select()` projections): mostly a few lines each.
3. **#5** (cache headers / lazy guest cookie).
4. **#7 + #8** (compact legacy paths during migration; incremental replay).
5. **#10 + #11** (drop node-canvas, `preferRest`, check region): cold starts.
6. The rest as convenient. Skip #12–14 if the atproto cut-over is close.
