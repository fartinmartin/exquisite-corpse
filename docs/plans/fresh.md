# /fresh becomes the site

**Decision (2026-11-26):** the from-scratch prototype at `/fresh` is the
direction for exquisite corpse club. It still needs polish before it replaces
the main routes and merges.

**Branch (2026-11-27):** `fresh` is cut from `firestore` and carries only the
settled work, ported (not merged) from `feat/layout-lab`. The explorations
(brand lab, moodboard, fold lab, links lab, doodle/fold votes, `lib/kit`,
`lib/ui`, the first redesign of the old pages) stay in the archive tags, along
with `ux-playground`'s polish of the old pages.

## What /fresh is

A sheet of paper on a sky-blue desk. One framed object per page (the paper),
everything else plain type: IBM Plex Sans + Plex Mono, the original palette,
yellow only as a highlighter.

- `/fresh` home: a random creature in the creature view (below). Reload deals a new one.
- `/fresh/c/[id]` creature page: the same view, for one creature.
- `/fresh/s/[id]` section page: a playlist of the creatures the third is in (below).
- `/fresh/draw`: pick a third → draw (doodles leave) → name it in a sentence →
  unfolds in place from where you drew.
- `/fresh/look`: creatures / tops / middles / bottoms, sheets set down askew.
- Nav: `look`, then `draw` as the site's one call to action: a highlighter
  with a drawn pencil (`ui/pencil.svelte`) that scribbles on hover. No `?`
  menu (removed 2026-11-27); keys are on the buttons (`aria-keyshortcuts`).
- Layout: everything is centred horizontally. One-sheet pages (home and
  creature, the draw page's pick step, the section page's player) sit in
  the middle of the space under the header (`.middle`), slightly above true
  centre. The look wall doesn't (a short shelf would look stranded), and the
  draw page's later steps keep their top so the reveal unfolds in place.

Settled details:
- Folds (`lib/corpse/folds.ts`, picked in the fold lab): physically possible, flaps open only once their
  parent is flat (`staysInSquare`), and folded sheets show the back of the
  paper (`showsBack`) — except your own third in the draw reveal.
- Paper backs (`lib/corpse/backs.ts`): 8 CSS textures, one per creature, seeded.
- Links and buttons (`routes/fresh/+layout.svelte`, `routes/fresh/ui/`), one job each:
  `.hl` the next thing to do, `.squiggle` takes you somewhere, `.stamp` acts
  right here (no paper-tab buttons); doodled `Arrow`, like heart in
  `Actions`, `Swap` for labels that change without resizing.
- Creature credits live on the back of the paper (tap the sheet to turn it
  over): `ui/creature-sheet.svelte`, `ui/printed.svelte`. A section has one
  artist, so its byline is in plain sight under the title instead.
- Gesture hints ("tap the drawing to see who drew it") fade in after a beat
  and stop once you've done it (`ui/learned.svelte.ts`, localStorage).
- Doodles: real sections tinted sky blue, nine, drift + spring parallax,
  scatter while drawing (picked in the doodle lab). Press leans them toward
  the press point and squashes them a little (anticipation); release flings
  them away, harder the longer you held (up to 1.2s), and they wobble home on
  an underdamped spring. No tremble while holding.
- Look wall: images reserve their aspect ratio (square / 3:1) and show one of
  the quiet paper backs (dots, graph, ruled, scuffs) until they load.

## Creature view (home and /c/[id])

`ui/creature-view.svelte`. The sheet, title, then heart · copy link · download
· **another**. Tapping the sheet turns it over (credits) everywhere.

- **another** asks for a random id (`anotherCorpseId`, a command so it's never
  cached; `Corpses.randomId` loads no drawings) and navigates to
  `/fresh/c/<id>`. Every creature you land on is shareable, and back walks
  through them.
- Home keeps its URL (`/fresh`) on arrival. Leaving it via another pins home's
  history entry to the creature it showed (`replaceState` with
  `page.state.pinned`), so back returns to that creature instead of dealing a
  new random one.
- copy link always copies the creature's own URL, also from home.
- Keys: → another, ← back through creatures that another dealt (only those,
  so ← never leaves the site).
- **Toss:** creature to creature (another, back/forward) the sheet is tossed
  aside left and the next lands from the right, still folded, then unfolds;
  back runs it the other way (view transitions in `fresh/+layout.svelte`,
  names `creature` / `creature-meta`). Rule: toss when one sheet is replaced
  by a *different* sheet; not when the same sheet changes state, so the
  section playlist only folds and unfolds.
- The next creature is dealt ahead: a second after one settles, its id,
  drawings and the page code are fetched, so the toss starts in ~20ms
  instead of waiting ~700ms on two round trips.

## Section page: a playlist (/s/[id])

`ui/section-player.svelte`, decided 2026-11-27.

- Step 0: the third on its own, unfolded in its slot of the square with the
  other two thirds hatched (the draw page's "someone else's third" stripes;
  blank white would read as unfinished). Blank thirds render hatched anywhere
  a fold has no drawing (`.front[data-blank]` in `lib/corpse/fold.svelte`).
- → unfolds it into the creatures it's in, **newest first**
  (`Sections.creatures`, capped at the 60 most recent); → again folds it back
  up and opens the next; ← goes back, to the solo step at the start.
- **Visible arrows** either side of the sheet (under it, around the caption,
  on phones), plus ←/→ keys. Same keys as the creature view with a different
  meaning (next in this list vs. another random): fine, it's per page.
- Caption: "on its own · in N creatures", then "in <creature> · 2 of 6" with a
  link to the creature.
- `?in=<creatureId>` opens straight to a step; stepping updates it in place
  (`replaceState`, no history entries).
- Below: title, "a middle by <artist>", the section's heart / copy link /
  download, then "more by <artist>". The old "lives in" grid is gone; the
  playlist replaces it.

## Artists (waiting on atproto)

An artist page is wanted, but it waits for atproto (itself on hold until
happyproto.at and protobase.at are live). What the page *is* depends on identity:

- **Today** a name is free text, remembered in a cookie: anyone can sign as
  anyone. A page could only say "drawings signed X", keyed by an unverified
  string.
- **With atproto** a drawing belongs to a DID and its handle: verifiable, and a
  real profile. The page URL can be the handle: `/fresh/a/<handle>` (reserved).
- **Anonymous** users keep drawing without an account. No page (as with
  "anonymous" today).
- **Old string-signed drawings** need a claim path ("these are mine"), which
  can't be verified from a name alone. Design it with the atproto work, not
  before.

What the page could show: their thirds (newest / most liked), the creatures
those ended up in, hearts collected, and who they've drawn with (the other
artists on their creatures, each linked to their own page).

Done now so the page is a small change later: every artist name on /fresh goes
through `ui/artist.svelte` (today: `@names` link to Instagram as on the old
site, everything else is plain text). Linking names to the artist page is a
change in that one component.

## Resume here

- [x] Paper backs: keep all 8.
- [ ] Measure ink bleed-through, which renders each folded panel twice.
- [ ] Promote `/fresh` onto the main routes (`/`, `/draw`, `/gallery/...`),
      keeping old URLs working.
- [ ] Delete what `/fresh` replaces: the old pages and their components
      (`lib/components`: canvas-panel, section-picker, toolbar, save-modal,
      help, nav, pixel cursor, …).
- [ ] Restyle `/admin` to match.
- [ ] Run once against real Firestore: save, likes, corpse thumbnail.
- [ ] Unit tests for the fold rules (`staysInSquare`, `showsBack`).
- [ ] Real-device check on a phone (only checked in 390px frames so far),
      including the doodles' press/hold/release.
- [ ] Artist page, with atproto (see "Artists").
