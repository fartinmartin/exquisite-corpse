# Exquisite Corpse Club — Next Steps

## What's done

- Monorepo scaffold (lexicons, core, app, scripts)
- atproto OAuth: login → Bluesky → callback → DID cookie
- DB: Drizzle + libSQL, all schemas colocated and migrated
- Core utilities: `createID`, `Log`, `createContext`, transactions, `errore` error pattern
- Lexicon schemas: `DrawingDataSchema`, `SectionRecordSchema`
- `Section` namespace: `validateDrawing`, `buildRecord`, `parseRecord`
- `Render` namespace: stubbed (not implemented)

---

## Decisions

**Corpse matching** — when a user picks a section type, the server randomly selects existing sections to pair with. A corpse slot is a set of three section records sharing a `corpseId`. When the user submits, they fill the open slot. Randomness can be skewed (see Phase 2c).

**Moderation** — async queue. Sections/drawings default to `pending` and are hidden from the gallery until approved. Moderation logic lives in a `POST /internal/mod/process` SvelteKit endpoint (secured with `Authorization: Bearer <CRON_SECRET>`), called on a schedule by any external cron trigger (GitHub Actions, cron-job.org, CF Workers, etc. — TBD at deploy time). The endpoint calls Google Cloud Vision SafeSearch API and updates each row's status. On rejection: delete PDS records and resolve the drawing URI to a "removed" placeholder state in the gallery. Users can report drawings, which re-queues them for review. Self-hosted Ozone is a future option for a human review UI on top of the automated check.

**Guest drawings on PDS** — write all section records (guest and auth'd) to the club's bsky.social account immediately. Guest records include a `guestId` field (opaque token). On signup, migrate: delete from club account, re-write to user's own PDS. This keeps everything truly atproto and indexed by the firehose from day one.

**Corpse record type** — yes, `club.exquisitecorpse.drawing` is a real record. Corpses are "born" on write: when the third section is submitted the server assembles the corpse and writes the drawing record to the club PDS account. This enables feed/firehose support and gives assembled corpses a stable URI.

---

## Data model additions needed

Before coding starts, a few schema gaps to fill:

- **`corpseId`** — sections need a shared ID so they can be grouped. Add `corpseId: text` to the `guest_drawings` table and include it in `SectionRecordSchema` (optional at creation, set by server when a slot is filled).
- **`DrawingRecordSchema`** in `@ecc/lexicons` — the assembled corpse record: `{ $type, corpseId, topUri, midUri, botUri, renderedBlob, createdAt }`.
- **`corpses` table** in `@ecc/core` — local index of assembled corpses for fast gallery queries (avoids PDS list scans).
- **`moderation_queue` table** in `@ecc/core` — `(id, section_uri, drawing_uri, status, reason, reported_at, resolved_at)`.
- **`reports` table** in `@ecc/core` — `(id, drawing_uri, reporter_did, reporter_guest_token, created_at)`.

---

## Phase 1 — Section submission pipeline

Everything needed to actually save a drawing.

### 1a. `Render.toPng()` in `@ecc/core`

Implement headless canvas-paint rendering in `packages/core/src/render/index.ts`.

- Install `node-canvas` and `@fartinmartin/canvas-paint`
- Replay `DrawingData.paths` onto a node-canvas `Canvas` using canvas-paint's headless mode (or manually)
- Return a `Buffer` (PNG)
- Keep this pure — no side effects, no DB, no PDS writes

### 1b. Moderation queue

Add a `moderation_queue` table (`id`, `section_uri`, `drawing_uri`, `status: pending | approved | rejected`, `reason`, `reported_at`, `resolved_at`).

On section submission: insert a row with `status: pending`. Gallery queries filter to `approved` only. Rejected URIs resolve to a "removed" placeholder (custom image TBD).

**`POST /internal/mod/process`** — the processing endpoint in `packages/app/src/routes/internal/mod/process/+server.ts`:
- Verify `Authorization: Bearer <CRON_SECRET>` header
- Fetch pending rows from `moderation_queue`
- For each: call Google Cloud Vision SafeSearch API (`@google-cloud/vision`) with the PNG blob
- Update row status to `approved` or `rejected`
- On rejection: delete the PDS record via atcute, mark any assembled corpse as rejected too

Trigger is platform-agnostic — any HTTP cron service can call this endpoint. Decision deferred to deploy time (GitHub Actions `schedule:`, cron-job.org, CF Workers, etc.).

**Report button** — on assembled drawings in the gallery. Writes to a `reports` table (`drawing_uri`, `reporter_did | reporter_guest_token`, `created_at`) and re-queues the drawing as `pending` in `moderation_queue`.

### 1c. Corpse slot matching in `@ecc/core`

Add `Section.findOrCreateSlot(sectionType)` — the server-side logic for pairing a new drawing with existing ones.

- Query DB for an open corpse slot that needs `sectionType` (i.e. a `corpseId` that has the other two sections but not this one)
- If none found: create a new `corpseId`, return it as a fresh slot
- Skew ideas: prefer slots where the sibling sections were submitted recently; prefer slots from users who haven't drawn together before; weight by recency to avoid long-abandoned slots

### 1d. Section submission endpoint

Create `packages/app/src/routes/api/sections/+server.ts`.

Flow:
1. Parse request body as `DrawingData` via `Section.validateDrawing()`
2. Call `Section.findOrCreateSlot(sectionType)` → get `corpseId`
3. Call `Render.toPng()` → get PNG buffer
4. Call `Render.moderate()` → return 400 if not ok
5. Determine author: `requireAuth` DID, or generate/read guest token from cookie
6. Upload PNG blob to club PDS via atcute
7. Write `club.exquisitecorpse.section` record (with `corpseId` + `guestId` if guest)
8. Insert into `guest_drawings` table (guestToken → recordUri → corpseId)
9. Check if this was the third section for `corpseId` → if so, assemble the corpse (see Phase 3a)
10. Return the record URI

---

## Phase 2 — Drawing UI (`/draw`)

`packages/app/src/routes/draw/+page.svelte`

### 2a. Section picker

- `top` / `mid` / `bot` choice UI
- On pick: call a remote `query` to `Section.findOrCreateSlot()` and return the sibling section previews
- Chosen section determines canvas dimensions and which edge shows the adjacent preview

### 2b. Canvas

- Mount `@fartinmartin/canvas-paint` on a `<canvas>` element
- Tool controls: brush size, color, eraser
- `paint.save()` → `DrawingData` (already matches `DrawingDataSchema`)

### 2c. Adjacent section preview

- Fetch the sibling section's rendered PNG blob from PDS
- Display a narrow strip at the edge of the canvas (pixelated/blurred) so the player can roughly align
- For `mid`: show bottom edge of `top` section above, top edge of `bot` section below
- The preview reveals only a sliver — enough to align, not enough to copy

### 2d. Slot freshness / skew options

Ideas to weight slot selection (pick one to start, tune later):
- **Recency bias** — prefer slots where siblings were submitted in the last N hours (avoids pairing with abandoned drawings)
- **Variety bias** — avoid pairing the same two DIDs who already drew together recently
- **Popularity bias** — prefer sibling sections that got likes in the gallery (quality signal)

### 2e. Submit

- POST `DrawingData` + selected `sectionType` to `/api/sections`
- Show loading state via `<svelte:boundary>` + `pending` snippet
- On success: redirect to a confirmation page or the gallery entry for this corpse

---

## Phase 3 — Gallery (`/gallery`)

`packages/app/src/routes/gallery/+page.svelte`

### 3a. Corpse assembly (on third section write)

Triggered inside the section submission endpoint when all three sections of a `corpseId` are present.

1. Fetch all three section records from PDS
2. Composite the three PNGs (top / mid / bot) into one image via `node-canvas`
3. Upload composited PNG as blob to club PDS
4. Write `club.exquisitecorpse.drawing` record: `{ corpseId, topUri, midUri, botUri, renderedBlob, createdAt }`
5. Insert into local `corpses` table for fast gallery queries

### 3b. List completed corpses

- Query local `corpses` table (fast) — fall back to PDS list scan if needed
- Render each as the composited image
- Paginate with cursor

### 3c. Likes

- Guest likes: insert into `likes` table (keyed by `guestToken + drawingUri`)
- Logged-in likes: insert into `likes` table (keyed by `likerDid + drawingUri`) + optionally write `app.bsky.feed.like` to their PDS
- `Gallery` namespace in `@ecc/core` — `Gallery.like()`, `Gallery.unlike()`, `Gallery.getLikeCount()`

---

## Phase 4 — Guest user flow

### 4a. Guest session

- On first visit (no DID cookie): server generates a guest token, sets it as a `HttpOnly` cookie
- All guest actions (drawing, liking) are associated with this token server-side

### 4b. Guest → atproto migration on signup

When a guest completes OAuth:
1. Look up all `guest_drawings` rows by guest token
2. For each: delete the record from club PDS, re-write to user's own PDS with their DID
3. Update `guest_drawings` rows: set author DID, clear guestToken
4. Migrate `likes` rows: set `likerDid`, clear `guestToken`
5. Clear the guest token cookie

---

## Phase 5 — Firehose / real-time (later)

- Subscribe to the atproto firehose in `hooks.server.ts` on startup
- Index incoming `club.exquisitecorpse.section` and `club.exquisitecorpse.drawing` records into local DB
- Enables feed generation and removes reliance on PDS list queries for the gallery
