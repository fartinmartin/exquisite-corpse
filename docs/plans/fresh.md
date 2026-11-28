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
- `/fresh/draw`: pick a third → draw (doodles leave) → name it in a sentence
  ("this middle is called ___ by ___ **reveal →**") → straight to the
  creature's own page: your third zooms out into its slot of the square (the
  others folded behind it; view transition `drawn-third`), *then* the
  creature unfolds there, and the title arrives. The reveal is the last thing
  that happens, in its final place. No "meet it" step; "you drew the middle"
  under the title (`page.state.drawn`). "reveal" over "save"/"unfold": it
  names the moment, and it's what happens (saved, then revealed).
  Without view transitions (Safari < 18, e.g. older iPads) there's no zoom:
  the creature page appears with your third folded in its slot, then unfolds.
- `/fresh/look`: creatures / tops / middles / bottoms, sheets set down askew.
- Nav: `look`, then `draw` as the site's one call to action: a highlighter
  with a drawn pencil (`ui/pencil.svelte`) that scribbles on hover. The
  highlight draws itself in once on arrival and is re-marked left to right
  on hover (all `.hl` buttons). No squiggle under it as well: one mark per job. No `?`
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
- Doodles: 9 around the sheet, 12 on wide screens (≥1280px) where the desk
  is mostly empty, 4 fainter ones on look (already full of drawings). On wide
  screens they come in toward the sheet (each has a `reach`; `CLEAR` in
  `doodle-field.svelte` is the empty zone's half-width).
- Side room: `--gutter` (at least 24–32px on phones) and `overflow-x: clip` on
  `.fresh`, so tilted, folding or turning sheets never scroll sideways. The
  draw page keeps narrower sides for the canvas.
- Look wall: images reserve their aspect ratio (square / 3:1) and show one of
  the quiet paper backs (dots, graph, ruled, scuffs) until they load.

## Creature view (home and /c/[id])

`ui/creature-view.svelte`. The sheet, title, then heart · share · download ·
replay · **random** (no arrow: it has no direction). Tapping the sheet turns it over (credits) everywhere.

- The heart stays bare (no stamp): it reads as a control on its own; stamps
  are for actions on the thing. 44px to tap.
- **share**: the system share sheet on touch devices, otherwise copies the
  link ("copied!"). Always the creature's own URL. Over plain http (the dev
  server on Wi-Fi) there's no share sheet or Clipboard API: it copies the
  old way (`ui/copy.ts`), and shows the link in a prompt if even that fails.
- **replay** (the old site's playback): the creature blanks and redraws
  itself stroke by stroke, third by third *in the order they were drawn*
  (`lib/corpse/playback.ts`). A section page's solo step draws itself in on
  arrival. Not at reveal time.
- **random** (was "another"; still `another` in code and `page.state`) asks
  for a random id (`anotherCorpseId`, a command so it's never cached;
  `Corpses.randomId` loads no drawings) and navigates to `/fresh/c/<id>`.
  Every creature you land on is shareable, and the browser's back walks
  through them.
- Home keeps its URL (`/fresh`) on arrival. Leaving it via random pins home's
  history entry to the creature it showed (`replaceState` with
  `page.state.pinned`), so back returns to that creature instead of dealing a
  new random one.
- copy link always copies the creature's own URL, also from home.
- Either direction deals a new one (2026-11-28): swipe left or → brings it
  from the right, swipe right or ← from the left, the button picks a side.
  Going back is the browser's job (button, iOS edge swipe).
- **Toss:** creature to creature (random, back/forward) the sheet is tossed
  aside and the next lands from the opposite side (`ui/toss.ts`), still
  folded, then unfolds; back sends it out the way it came in (view
  transitions in `fresh/+layout.svelte`,
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
- Caption: "in N creatures" (touch adds ", swipe to see them"; with a mouse
  the arrows say it), then "in <creature> · 2 of 6" with a link to the
  creature.
- `?in=<creatureId>` opens straight to a step; stepping updates it in place
  (`replaceState`, no history entries).
- Below: title, "a middle by <artist>", the section's heart / copy link /
  download, then "more by <artist>". The old "lives in" grid is gone; the
  playlist replaces it.

## Touch (phones, iPad)

Decided 2026-11-27. Controls go in thumb reach by default; they are not
freely movable or dockable (most people draw once, on a device they've never
drawn on here; floating palettes are a power-user idea). They can get out of
the way instead.

Pass 1 (done):
- **Phones** (touch + narrow): a dock fixed to the bottom of the screen
  (`ui/tools.svelte`): undo · draw/erase/fill · current colour (sized like the
  brush) · done. The colour opens a sheet above it: palette, size, + colour,
  redo, clear (clear one step away on purpose). Starting a stroke closes the
  sheet. A grip tucks the dock down to a sliver and back.
- **iPad** (touch + wide): the desktop row with 44px targets (colour dots
  keep their size, with a 44px tap area) and a sheet up to 1000px wide.
- Every touch target ≥ 44px. The page can't scroll or bounce while drawing.
- The draw page is centred too: the drawing step is measured once, and sign
  and reveal keep that top so the reveal still unfolds in place.

Pass 2 (done):
- **Phone landscape** (701×234 to draw in on an iPhone-size screen, vs 346×115
  in portrait): the header hides while drawing and the dock becomes a rail
  down one side; the colour sheet opens beside it. "⇆ left/right side" in the
  sheet flips the rail (`ui/hand.svelte.ts`, remembered per device). Portrait
  shows "↻ turn your phone sideways for more room" until you have once.
- **Input layer** (`lib/draw/touch-input.ts`, capture phase in front of
  canvas-paint): a pen draws immediately (Apple Pencil via `touchType`,
  other styluses via `pointerType: "pen"`); once a pen has touched, fingers
  and palms don't draw (palm rejection). One finger draws after ≤70ms / 6px
  so a second finger can make it a gesture without a stray dot. Two-finger
  tap undoes, three-finger tap redoes.
- **Swipe** (`ui/swipe.ts`): creature (either way for a new one), section
  player (steps), look (shelves). The sheet follows the finger and fades
  with the distance, and springs back if it doesn't count. When it counts:
  the creature/look item fades out and the next fades in (where there are
  no view transitions; otherwise the toss carries it); the section sheet
  comes back as it folds over. Vertical scroll still works; a swipe is never
  also a tap; edge swipes are left to iOS.
- **No stray scroll on phones:** heights use `svh`, not `vh` (vh is the
  height with the address bar hidden). No rubber-band either
  (`overscroll-behavior: none` on /fresh): an app shell, and Safari's bounce
  showed the plain colour behind the dotted pattern. The draw page's pick
  square also fits the height (iPad landscape).
- **Not done: pencil pressure.** canvas-paint renders a stroke at one width
  (its first point's size). Pressure needs variable-width rendering in
  canvas-paint, which also renders server thumbnails, so it would bump
  `RENDER_VERSION`. Possible, separately.
- Still needs real devices: Pencil palm rejection, gesture feel, rail reach.

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

- [ ] Pick the call-to-action look (`.hl`). Heading toward a hand-drawn loop
      (the highlighter isn't a metaphor used anywhere else), with a pencil
      that starts without a line and draws once. Loop and pencil variants on
      an uncommitted workshop page, `routes/fresh/lab/loop` (first round:
      `lab/hl`; delete both once picked).
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
- [x] Touch pass 2 (see "Touch"). Try on a real phone and iPad.
- [ ] Pencil pressure: variable-width strokes in canvas-paint (renderer + thumbs).
