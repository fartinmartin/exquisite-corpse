# exquisite corpse club™

- [Figma prototype](https://www.figma.com/proto/RNg8lCVQnMU5HAeYxu03UT/exquisite-corpse-club?node-id=40%3A25&scaling=min-zoom)
- [TODOs](https://trello.com/b/JmK3HtwP/exquisite-corpse-club™)
- [Case study](https://www.martinlindberg.me/exquisite-corpse-club/)

## The _what_ club?

An exquisite corpse is a collaborative drawing made up of three sections. Each section is drawn by a different artist who can't see the other sections. The results are sometimes strange but always entertaining. I adapted this analog collaborative drawing game for the remote world of 2020!

## This branch — migrating the live site to SvelteKit

The live site (`exquisitecorpse.club`) runs the 2020 Nuxt/Vue app on the `firebase`
branch. This branch ports it to:

- **[SvelteKit](https://kit.svelte.dev/)** — with **remote functions** and
  **async Svelte** (`await` in pages)
- **Firestore** (the same `exquisite-corpse-club` project) — via
  `packages/firestore` (`@ecc/firestore`) and `firebase-admin`
- **[@fartinmartin/canvas-paint](https://github.com/fartinmartin/canvas-paint)** —
  drawing engine; new sections store canvas-paint stroke data, old drawings are
  normalized at read time
- **Netlify** — SSR (not a static SPA: remote functions need a server)

The atproto rewrite lives on the `atproto` branch and comes next.

## Packages

```
packages/
  firestore/  @ecc/firestore  — Firestore domains (Sections, Corpses, Likes, Admin, Drawing)
  lexicons/   @ecc/lexicons   — Valibot schemas shared with the atproto branch
  core/       @ecc/core       — atproto/db work, unused on this branch
  app/        @ecc/app        — SvelteKit app
  scripts/    @ecc/scripts    — one-off tooling
```

## Dev setup

```bash
pnpm install
pnpm dev                      # varlock injects secrets from 1Password

# no Firebase credentials yet? use fixtures:
ECC_FIXTURES=1 pnpm dev
```

Environment variables are documented in `packages/app/.env.schema` and
`.env.example`. Copy `.env.example` to `.env` if you're not using varlock.

## Deploy

Netlify builds the app (`netlify.toml`); Firebase only stores data now. Set the
service-account variables and `ECC_ADMIN_PASSWORD` in the Netlify UI.
