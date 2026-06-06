# @ecc/app — SvelteKit app

## Experimental flags (svelte.config.js)

Both are enabled and required:
- `compilerOptions.experimental.async` — `await` in component markup and `$derived`
- `kit.experimental.remoteFunctions` — `.remote.ts` files (`query`, `form`, `command`, `prerender` from `$app/server`)

## Route conventions

- **Data fetching** → `.remote.ts` files with `query`. Prefer over `+page.server.ts` load functions.
- **Mutations** → `.remote.ts` files with `form` (spreads onto `<form>`) or `command` (called from event handlers).
- **Auth-required server logic** → `+page.server.ts` / `+server.ts` only when needed (OAuth flow, redirects, cookie writes).
- **Loading/error states** → `<svelte:boundary>` with `pending` snippet.

## Auth

atproto OAuth — two-step by nature, cannot be a remote function:
1. `login/+page.server.ts` — form action resolves handle → redirects to Bluesky
2. `oauth/callback/+server.ts` — receives code, sets `did` cookie
3. `oauth/jwks.json/+server.ts` — serves public JWK for OAuth client registration
4. `client-metadata.json/+server.ts` — serves OAuth client metadata

Session helpers are in `src/lib/atproto/auth.ts`: `getAuthContext`, `requireAuth`, `setSessionCookie`, `clearSessionCookie`.

Logged-in user's DID is available in all layouts/pages via `data.user?.did` (set in `+layout.server.ts`).

## Secrets / env

`pnpm dev` runs `varlock run -- vite dev` which injects secrets from 1Password. Never run `vite dev` directly. Schema is at `.env.schema`.

## Ideas / future work

### Drawing data storage (atproto record size)
Currently `drawing: DrawingData` is stored inline in the atproto section record as JSON. For complex drawings this could hit PDS record size limits.

**Why a blob attachment?** atproto distinguishes between *record data* (typed JSON fields, size-limited, indexed) and *blobs* (arbitrary binary, referenced by CID). Large or binary payloads belong in blobs — it's the same reason the rendered PNG is already a blob. Gzip the drawing JSON, upload it as `application/octet-stream`, store the CID in the record. The record stays small; the drawing data can be as large as the PDS allows for blobs.

**Why it's a significant change:**
- `SectionRecordSchema` and the atproto lexicon need `drawing` changed from an inline `DrawingData` object to a blob reference (`{ $type: "blob", ref, mimeType, size }`)
- `Section.buildRecord()` no longer receives `drawing: DrawingData` — it receives a blob CID after a separate upload step
- `Render.toPng()` currently receives a `DrawingData` directly; it would instead need to fetch + decompress the blob first
- Any code that reads a section record to replay or display the drawing (e.g. gallery, video export) needs a blob download + decompress step before it has usable data
- Requires a migration for any existing records that have `drawing` inline

### Canvas texture
Idea: apply a procedural paper/grain texture to the drawing canvas (see https://shaders.paper.design/ for the approach). Two options:
- **Pre-baked tile**: ship a small (256×256) paper grain PNG, composite it over the canvas using `multiply` blend mode. Replicate in `Render.toPng()` / `Render.composite()` using node-canvas `drawImage`. Zero storage cost, works today.
- **Procedural noise**: port Simplex noise to JS, run identically in browser and server. Store `texture: { seed, intensity }` in the record so every render is deterministic.
The pre-baked approach is the right starting point.
