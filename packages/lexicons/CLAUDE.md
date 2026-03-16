# @ecc/lexicons — schemas and types

Valibot schemas are the **source of truth**. atproto JSON lexicons are derived from them, not the other way around.

## Adding or changing a record type

1. Edit/add a schema in `src/schemas/`
2. Export from `src/index.ts`
3. Run `pnpm generate` to regenerate `generated/*.json` (these are gitignored — generated at build time)
4. Rebuild: `pnpm build`

## Key schemas

- `DrawingDataSchema` — mirrors canvas-paint's `paint.save()` output exactly. This is what gets stored in the atproto record.
- `SectionRecordSchema` — the full `club.exquisitecorpse.section` record. The `render` blob field is omitted here (server-managed, not validated client-side).

## Standard Schema

Valibot is Standard Schema compliant. Pass schemas directly to remote function validators:

```ts
import { DrawingDataSchema } from '@ecc/lexicons';
import { query } from '$app/server';

export const getDrawing = query(DrawingDataSchema, async (drawing) => { ... });
```
