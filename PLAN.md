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

**Corpse matching** — a corpse requires exactly one `top`, one `mid`, and one `bot` section. Matching happens at pick time (not submission) so the adjacent section previews can be shown while drawing. The two sibling sections are tentatively reserved with a `reserved_until` timestamp (30 minutes) so they can't be matched to another user mid-draw. On submission, the reservation is confirmed and a `corpseId` is assigned. Expired reservations are released (checked lazily on next match query). If no match is available, the user draws without a preview and their section is saved unmatched to be paired later.

**Moderation** — Vision API is synchronous (~100–200ms), so moderation runs inline during submission. No cron or queue needed. Sections/drawings are marked `approved` or `rejected` immediately. `pending` is only a fallback for if Vision is unavailable. Rejected content is removed from PDS and resolves to a "removed" placeholder in the gallery. Owners can see their own `pending` content. No moderation pass on the composited corpse image (all three sections were individually approved).

**PDS writes** — authenticated users write section records to their own PDS. Guests write to the club's bsky.social account (records include a `guestId` field). On signup, guest records are migrated: deleted from club account, re-written to the user's own PDS. Already-assembled corpse records are updated to point to the new URIs (see Phase 4b).

**Corpse record** — `club.exquisitecorpse.drawing` is written when the third section is approved and the corpse is assembled. The server composites the three PNGs. Corpses are "born", not generated on view.

**Bsky post on approval** — when a corpse is assembled, the server writes an `app.bsky.feed.post` to the club's bsky account: composited image, the corpse's generated title, and @mentions of any authenticated contributors (guests listed anonymously). Gives the club a natural feed and notifies artists when their corpse is born.

**Titles** — each section gets a random title generated via [joyful](https://github.com/haydenbleasel/joyful) at submission time. Owners can edit their section's title later. The assembled corpse's title is a mashup of the three section titles using one of several dependency-free string strategies (picked at random): e.g. first word of title 1 + middle word of title 2 + last word of title 3, or random word from each, etc. 3–4 strategies total.

**Guest handles** — guests get a random display handle generated via joyful when their session starts. Stored with the guest token.

**Drawing animation** — on section/drawing pages, use `paint.load(drawing)` to replay strokes client-side from the data already in the record. No extra storage needed. `paint.toVideo()` saved for a future share/export feature.

---

## Data model additions needed

- **`corpseId`** — add to `guest_drawings` table and `SectionRecordSchema` (nullable until matched)
- **`DrawingRecordSchema`** in `@ecc/lexicons` — `{ $type, corpseId, topUri, midUri, botUri, renderedBlob, createdAt }`
- **`corpses` table** — local index of assembled corpses for fast gallery queries
- **`moderation_status`** column — add to relevant tables (`pending | approved | rejected`)
- **`reserved_until`** column on section records in DB — nullable timestamp, set at pick time, cleared on submission or expiry

---

## Phase 0 — Prerequisites

### 0a. DB migrations

- Add `corpseId` (nullable) to `guest_drawings`
- Add `moderation_status` (`pending | approved | rejected`) to `guest_drawings`
- Add `reserved_until` (nullable timestamp) to `guest_drawings`
- Create `corpses` table

### 0b. Lexicon updates

- Add `corpseId` (nullable) to `SectionRecordSchema`
- Add `DrawingRecordSchema` — `{ $type, corpseId, topUri, midUri, botUri, renderedBlob, createdAt }`

### 0c. Guest session — `hooks.server.ts`

- In `handle()`: if no guest token cookie, generate one + a random joyful handle, set both as `HttpOnly` cookies
- Guest token + handle associate drawings and likes server-side for the duration of the session

---

## Phase 1 — Section submission pipeline

### 1a. `Render.toPng()` in `@ecc/core`

- Install `node-canvas` + `@fartinmartin/canvas-paint`
- Replay `DrawingData.paths` onto a node-canvas canvas, return a PNG `Buffer`
- Pure function — no DB or PDS side effects

### 1b. Section submission — `src/routes/api/sections/+server.ts`

1. Validate `DrawingData` via `Section.validateDrawing()`
2. `Render.toPng()` → PNG buffer
3. Call Vision SafeSearch (`@google-cloud/vision`) → approve or reject inline
4. On rejection: return 400 with reason
5. Determine author (DID from cookie, or guest token)
6. Upload PNG blob + write section record to appropriate PDS (own for auth'd, club for guest)
7. Insert into `guest_drawings` (guest only)
8. Confirm reservation: assign `corpseId` to all three sections, clear `reserved_until`
9. If corpse is now complete → call `assembleCorpse()` (Phase 3a)
10. Return record URI + match status

### 1c. Matching logic — `Section.findMatch(sectionType)`

- Query DB for one available unmatched section of each of the other two types
- "Available" = approved + unmatched (`corpseId` is null) + not currently reserved (`reserved_until` is null or expired)
- Sets `reserved_until = now + 30 minutes` on matched sections
- Expired reservations released lazily on next query (no cron needed)
- Returns the two sibling record URIs + their PNG blobs for preview, or `null` if no match
- Skew: prefer recently submitted (recency). Variety/quality skews are future work.

---

## Phase 2 — Drawing UI (`/draw`)

### 2a. Section picker

- `top` / `mid` / `bot` choice
- On pick: call `Section.findMatch(sectionType)` server-side — reserves sibling sections with a `reserved_until` timestamp, returns their PNG blobs for preview
- If no match available: proceed without preview, section will be paired later

### 2b. Adjacent section preview

- Show a narrow strip at the canvas edge (pixelated/blurred) from the reserved sibling PNGs
- `mid` shows both edges; `top` shows only the bottom strip; `bot` shows only the top strip

### 2c. Canvas

- Mount `@fartinmartin/canvas-paint` on `<canvas>`
- Tool controls: brush size, color, eraser
- `paint.save()` → `DrawingData` (matches `DrawingDataSchema`)

### 2d. Submit

- POST `{ drawing: DrawingData, section: SectionType }` to `/api/sections`
- Loading state via `<svelte:boundary>` + `pending` snippet
- On success: redirect to the section page (shows `paint.load()` replay animation)

---

## Phase 3 — Gallery + assembly

### 3a. Corpse assembly — `assembleCorpse(corpseId)` in `@ecc/core`

Called as a plain function from the submission handler when the third section completes a corpse:

1. Fetch the three section PNG blobs
2. Composite top/mid/bot vertically via `node-canvas`
3. Upload composited PNG blob to club PDS
4. Generate corpse title: pick one of 3–4 dependency-free string mashup strategies at random, apply to the three section titles
5. Write `club.exquisitecorpse.drawing` record
6. Insert into local `corpses` table
7. Write `app.bsky.feed.post` to club bsky account: composited image + corpse title + @mentions of authenticated contributors

### 3b. Gallery (`/gallery`)

- Query `corpses` table (approved only, plus own pending)
- Render composited image for each
- Paginate with cursor

### 3c. Section + drawing pages

- Load record from PDS
- Animate into existence with `paint.load(drawing)` — strokes replay client-side
- For assembled drawings: replay each section sequentially or simultaneously (TBD)

### 3d. Likes

- Guest: `likes` table keyed by `guestToken + drawingUri`
- Auth'd: `likes` table keyed by `likerDid + drawingUri`, optionally write `app.bsky.feed.like` to their PDS
- `Gallery.like()`, `Gallery.unlike()`, `Gallery.getLikeCount()` in `@ecc/core`

---

## Phase 4 — Guest user flow

### 4a. Guest session

Handled in Phase 0c — guest token + handle generated in `hooks.server.ts` on first visit.

### 4b. Migration on signup

1. Look up `guest_drawings` by guest token
2. For each section:
   - Delete from club PDS, re-write to user's own PDS → get new URI
   - Update `guest_drawings`: set DID, new record URI, clear guest token
   - If `corpseId` is set: update the corpse record on club PDS — overwrite the relevant `topUri`/`midUri`/`botUri` with the new URI (PUT, not delete+recreate, so the corpse URI stays stable)
3. Update `likes`: set `likerDid`, clear `guestToken`
4. Clear guest token cookie

---

## Phase 5 — Firehose (later)

- Subscribe to atproto firehose in `hooks.server.ts` on startup
- Index `club.exquisitecorpse.section` and `club.exquisitecorpse.drawing` records into local DB
- Removes reliance on PDS list scans, enables feed generation
