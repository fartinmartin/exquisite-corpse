# @ecc/scripts — one-off tooling

Scripts here are run manually, not as part of the app. No build step — uses `tsx` to run TypeScript directly.

## Scripts

- `migrate-drawings.ts` — **not yet implemented**. Will convert old Firestore path data (Vue canvas format) to canvas-paint `DrawingData` format for import into atproto records. Needs Firestore credentials and the old path schema confirmed before implementing.

## Running

```bash
pnpm migrate:drawings
```
