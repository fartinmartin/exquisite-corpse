# @ecc/core — server-side business logic

Compiles to `dist/` (NodeNext ESM). Must be built before `@ecc/app` can import it. Run `pnpm build` or `pnpm dev` (watch mode) while working on it.

## Structure

```
src/
  db/
    index.ts          Drizzle client (db) + re-exports drizzle-orm helpers
    transaction.ts    useTransaction, createTransaction, afterTx
  atproto/
    oauth.ts          getOAuthClient() — lazy singleton
    oauth.sql.ts      oauth_sessions, oauth_states tables
    atproto.errors.ts AuthExpiredError, AuthRequiredError, OAuthCallbackError
  section/
    index.ts          Section namespace
    section.sql.ts    guest_drawings table
    section.errors.ts SectionNotFoundError, DrawingValidationError, SectionAlreadyExistsError
  gallery/
    gallery.sql.ts    likes, profiles tables
    gallery.errors.ts LikeConflictError, CorpseNotFoundError
  render/
    index.ts          Render namespace (STUB — not yet implemented)
  util/
    context.ts        createContext — AsyncLocalStorage wrapper
    id.ts             createID + prefixes (e.g. createID('section') → 'sec_abc123')
    log.ts            Log namespace — structured tag-based logging
```

## Namespace pattern

```ts
export namespace Thing {
  export function doSomething(input: Input): Output | ThingError { ... }
}
```

Group related server-side functions in a namespace. Return errors as values — don't throw for expected failures.

## Error pattern (errore)

Errors are **returned as values**, not thrown. Each domain has a colocated `*.errors.ts` file.

```ts
// define (in section.errors.ts)
export class SectionNotFoundError extends errore.createTaggedError({
  name: 'SectionNotFoundError',
  message: 'Section $id not found',
}) {}

// return (in section/index.ts)
export function getSection(id: string): Promise<Section | SectionNotFoundError | DbError> {
  const row = await useTransaction((tx) => tx.select()...)
  if (!row) return new SectionNotFoundError({ id })
  return row
}

// handle (in a SvelteKit route)
const result = await Section.get(id)
if (result instanceof SectionNotFoundError) throw error(404, result.message)
if (result instanceof Error) throw error(500)
return result
```

All error classes are exported from `@ecc/core` so routes can `instanceof` check directly.

## Transactions

```ts
import { createTransaction, useTransaction, afterTx } from '@ecc/core'

// open a transaction (nested calls join the outer one)
await createTransaction(async (tx) => {
  await useTransaction((db) => db.insert(guestDrawings).values(...))
  await afterTx(() => sendNotification()) // runs after commit
})
```

## DB schema — colocated `.sql.ts` files

Tables live next to the code that uses them. `drizzle.config.ts` globs `./src/**/*.sql.ts` automatically — new tables just work.

| Table | File | Purpose |
|---|---|---|
| `guest_drawings` | `section/section.sql.ts` | Opaque guest ID → secret token + record URI |
| `likes` | `gallery/gallery.sql.ts` | Guest (token) and authenticated (DID) likes |
| `profiles` | `gallery/gallery.sql.ts` | Cached atproto profile data |
| `oauth_sessions` | `atproto/oauth.sql.ts` | atcute OAuth session storage (keyed by DID) |
| `oauth_states` | `atproto/oauth.sql.ts` | atcute PKCE state (short-lived) |

Migrations are in `drizzle/` — commit them. `DRIZZLE_LOG=true` enables SQL query logging.

## Utilities

- **`createID(prefix)`** — `createID('section')` → `sec_<nanoid>`. Add new prefixes to `util/id.ts` as needed.
- **`Log.create({ namespace: 'foo' })`** — structured tag-based logger. Chain `.tag()` to add context.
- **`createContext<T>()`** — AsyncLocalStorage wrapper. Used internally for transactions; available if needed elsewhere.

## What's a stub

`Render.toPng()` needs `node-canvas` + canvas-paint headless rendering.
`Render.moderate()` needs Google Vision SafeSearch or Hive Moderation.
Neither is implemented yet — both throw.
