# Exquisite Corpse Club — monorepo

Collaborative drawing game (exquisite corpse) built on atproto/Bluesky. Players draw one of three sections (top/mid/bot) without seeing others'. Sections are assembled into complete "corpses" displayed in a gallery.

## Packages

| Package | Name | Role |
|---|---|---|
| `packages/lexicons` | `@ecc/lexicons` | Valibot schemas + inferred TS types. Source of truth for all data shapes. |
| `packages/core` | `@ecc/core` | DB, atproto OAuth, business logic. Always runs server-side. |
| `packages/app` | `@ecc/app` | SvelteKit app. Thin UI layer — imports from core/lexicons. |
| `packages/scripts` | `@ecc/scripts` | One-off tooling (e.g. Firestore migration). |

## Commands

```bash
pnpm dev               # run the app (varlock injects secrets)
pnpm build             # build all packages in dependency order
pnpm check             # type-check all packages
pnpm lexicons:generate # generate atproto JSON from Valibot schemas
pnpm db:generate       # generate Drizzle migration
pnpm db:migrate        # apply migration
```

## Key conventions

- **Valibot** for all runtime validation (Standard Schema compliant — works directly with remote function validators)
- **Namespace pattern** for core business logic: `Section.buildRecord()`, `Render.toPng()`
- **Svelte 5 runes** throughout: `$state`, `$derived`, `$effect`, `$props`, `$bindable`
- **`.svelte.ts`** extension for reactive service files
- **`use` prefix** for singleton factory functions: `useMyService()`
- Drizzle migrations live in `packages/core/drizzle/` — commit them
- `@ecc/core` must be built before `@ecc/app` (it ships compiled JS, not raw TS)

## Secrets

Managed via varlock + 1Password. See `packages/app/.env.schema` for all vars and their 1Password refs. Run `pnpm dev` (not `vite dev` directly) — varlock injects secrets automatically.

For local OAuth dev, use a Cloudflare tunnel (`cloudflared tunnel --url localhost:5173`) so atproto can reach your callback URL.
