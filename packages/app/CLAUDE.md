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
