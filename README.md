# exquisite corpse club™

- [Figma prototype](https://www.figma.com/proto/RNg8lCVQnMU5HAeYxu03UT/exquisite-corpse-club?node-id=40%3A25&scaling=min-zoom)
- [TODOs](https://trello.com/b/JmK3HtwP/exquisite-corpse-club™)
- [Case study](https://www.martinlindberg.me/exquisite-corpse-club/)

## The _what_ club?

An exquisite corpse is a collaborative drawing made up of three sections. Each section is drawn by a different artist who can't see the other sections. The results are sometimes strange but always entertaining. I adapted this analog collaborative drawing game for the remote world of 2020!

## The tech deets

This branch is a ground-up rewrite using:

- **[SvelteKit](https://kit.svelte.dev/)** — frontend and server
- **[AT Protocol](https://atproto.com/)** (via [atcute](https://github.com/mary-ext/atcute)) — identity, OAuth, and user data storage on the Bluesky network
- **[Drizzle ORM](https://orm.drizzle.team/) + [Turso](https://turso.tech/)** — server-side DB for guest sessions, likes, and profile caching
- **[@fartinmartin/canvas-paint](https://github.com/fartinmartin/canvas-paint)** — drawing engine (stroke commands as canonical data, PNG rendered server-side)

Logged-in users authenticate with their Bluesky account (any PDS). Guest users get an ephemeral session; their drawings are hosted on the game's own account and can be migrated when they sign up.

## Packages

```
packages/
  lexicons/   @ecc/lexicons  — Valibot schemas + atproto lexicon JSON generator
  core/       @ecc/core      — DB, OAuth, business logic (Section, Render namespaces)
  app/        @ecc/app       — SvelteKit app
  scripts/    @ecc/scripts   — one-time tooling (e.g. drawing migration)
```

## Dev setup

```bash
# install dependencies
pnpm install

# run the app
pnpm dev

# type-check all packages
pnpm check

# generate atproto lexicon JSON from Valibot schemas
pnpm lexicons:generate

# DB migrations
pnpm db:generate
pnpm db:migrate
```

Copy `packages/app/.env.example` to `packages/app/.env` and fill in your values before running.
