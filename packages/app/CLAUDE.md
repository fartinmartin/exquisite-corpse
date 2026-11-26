# @ecc/app — SvelteKit app (Firestore migration)

The live site's Nuxt/Vue app is being replaced by this SvelteKit app, reading and
writing the **existing Firebase project** (`exquisite-corpse-club`). atproto is
deferred — that work lives on the `atproto` branch.

## Experimental flags (svelte.config.js)

Both are enabled and documented as experimental:
- `compilerOptions.experimental.async` — `await` in components and `$derived`
- `kit.experimental.remoteFunctions` — `.remote.ts` files (`query`, `command` from `$app/server`)

## Data flow

- **Reads** — `query` in a colocated `*.remote.ts` (e.g. `draw/draw.remote.ts`).
- **Writes** — `command` in the same place, called from event handlers.
- **SSR** — page data uses `$derived(await query(...))` **without** a
  `<svelte:boundary pending>` wrapper: a boundary with a `pending` snippet renders
  only that snippet on the server. Use boundaries only for intentionally
  client-loaded UI.
- **Auth-less identity** — `hooks.server.ts` sets `ecc_guest_token` (httpOnly) and
  `ecc_guest_handle` cookies. Likes are keyed by the token; the handle is the default
  artist name.
- **Admin** — `/admin` is guarded in `+page.server.ts`; the cookie is an HMAC of a
  timestamp keyed by `ECC_ADMIN_PASSWORD` (`src/lib/server/admin.ts`).

## Firestore package

`@ecc/firestore` (in `packages/firestore`) owns all Firestore reads/writes:
`Sections`, `Corpses`, `Likes`, `Admin`, plus `Drawing` (legacy drawing adapter and
server-side thumbnail composition).

The 2020 app stored `sections.drawing` as `{ [pathIndex]: PointCommand[] }`. New
drawings store canvas-paint `DrawingData`; `Drawing.toDrawingData()` normalizes both
shapes at read time. Don't write the legacy shape.

## Drawing (canvas-paint)

`@fartinmartin/canvas-paint` touches `document` at module scope, so it is imported
**dynamically inside `$effect`** (see `src/lib/components/canvas-panel.svelte`).
Display and pixelated previews use `render()` from `canvas-paint/render` and are
drawn by `src/lib/render.ts`; only the active panel mounts a `Paint` instance.

Paint measures its own canvas before CSS applies and can initialize at the document
width (1080px) instead of the CSS width. `canvas-panel.svelte` calls
`paint.resize({ target: host })` after creating it, and on host resize.

## Dev

```bash
pnpm dev             # varlock injects secrets, then vite
ECC_FIXTURES=1 pnpm dev   # in-memory sample data, no Firebase credentials needed
```

Fixture mode lives in `packages/firestore/src/fixtures.ts` and is only active when
`ECC_FIXTURES=1`.

Firestore emulator: set `FIRESTORE_EMULATOR_HOST` + `GCLOUD_PROJECT` instead of the
service-account variables.

## Deploy

Netlify (SSR functions) via `@sveltejs/adapter-netlify`; `netlify.toml` at the repo
root sets `base = packages/app`. Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
`FIREBASE_PRIVATE_KEY`, `ECC_ADMIN_PASSWORD` in the Netlify UI. Firebase keeps the
data; it no longer serves the app.
