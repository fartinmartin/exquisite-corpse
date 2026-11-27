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

- `/fresh` home: one creature, folded, unfolds on arrival; tap for another.
- `/fresh/draw`: pick a third → draw (doodles leave) → name it in a sentence →
  unfolds in place from where you drew.
- `/fresh/look`: creatures / tops / middles / bottoms, sheets set down askew.
- `/fresh/c/[id]` creature page (tap toggles the fold), `/fresh/s/[id]` section page.

Settled details:
- Folds (`lib/corpse/folds.ts`, picked in the fold lab): physically possible, flaps open only once their
  parent is flat (`staysInSquare`), and folded sheets show the back of the
  paper (`showsBack`) — except your own third in the draw reveal.
- Paper backs (`lib/corpse/backs.ts`): 8 CSS textures, one per creature, seeded.
- Links and buttons (`routes/fresh/+layout.svelte`, `routes/fresh/ui/`), one job each:
  `.hl` the next thing to do, `.squiggle` takes you somewhere, `.stamp` acts
  right here (no paper-tab buttons); doodled `Arrow`, like heart in
  `Actions`, `Swap` for labels that change without resizing.
- Details live on the back of the paper (tap to turn over) on creature and
  section pages (home: tap for another): `ui/creature-sheet.svelte`, `ui/strip-sheet.svelte`,
  `ui/printed.svelte`. Title also sits below the sheet.
- Doodles: real sections tinted sky blue, nine, drift + spring parallax,
  jiggle on taps, scatter while drawing (picked in the doodle lab).

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
- [ ] Real-device check on a phone (only checked in 390px frames so far).
