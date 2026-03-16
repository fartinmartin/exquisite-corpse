# @ecc/core — server-side business logic

Compiles to `dist/` (NodeNext ESM). Must be built before `@ecc/app` can import it. Run `pnpm build` or `pnpm dev` (watch mode) while working on it.

## Structure

- `src/db/` — Drizzle client (`db`) + schema. SQLite via Turso/LibSQL. `local.db` resolves relative to the compiled output when `DATABASE_URL` is unset.
- `src/atproto/oauth.ts` — lazy singleton `getOAuthClient()`. Reads `OAUTH_CLIENT_ID` and `OAUTH_PRIVATE_KEY_JWK` from env at first call.
- `src/section/` — `Section` namespace: validate incoming drawing data, build atproto record payloads, parse records from PDS.
- `src/render/` — `Render` namespace: **stub**. `Render.toPng()` and `Render.moderate()` are not yet implemented.

## Namespace pattern

```ts
export namespace Thing {
  export function doSomething(input: Input): Output { ... }
}
```

Group related server-side functions in a namespace. Throw errors explicitly — no silent fallbacks.

## DB schema tables

| Table | Purpose |
|---|---|
| `guest_drawings` | Maps opaque guest IDs → secret tokens + record URIs (token never goes in atproto record) |
| `likes` | Guest (token) and authenticated (DID) likes |
| `profiles` | Cached atproto profile data |
| `oauth_sessions` | atcute OAuth session storage (keyed by DID) |
| `oauth_states` | atcute PKCE state storage (short-lived) |

Migrations are in `drizzle/` — commit them. Generate with `pnpm db:generate`, apply with `pnpm db:migrate`.

## What's a stub

`Render.toPng()` needs `node-canvas` + canvas-paint headless rendering.
`Render.moderate()` needs Google Vision SafeSearch or Hive Moderation.
Neither is implemented yet — both throw.
