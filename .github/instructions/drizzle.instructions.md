---
description: 'Drizzle ORM + Node SQLite data-layer rules for Tailspin Toys'
applyTo: 'db/**/*.ts,src/lib/*.ts'
---

# Drizzle ORM + Node SQLite Instructions

Tailspin Toys keeps all content in a local SQLite database and reads it at build time. The app uses Drizzle ORM with Node.js's built-in `node:sqlite` driver; there is no runtime API layer or separate application server for data access.

## Layout

- `db/schema.ts` — the source of truth for Drizzle tables (`publishers`, `categories`, `games`) and inferred row types.
- `db/transforms.ts` — pure functions for CSV parsing, description shaping, deduplication, and deterministic derived values.
- `db/seed.ts` — idempotent seeding logic that loads `db/games.csv`.
- `db/migrate.ts` — applies generated migrations.
- `db/migrations/` — generated SQL migration files; do not hand-edit them.
- `db/test-helpers.ts` — `createTestDatabase()` creates a migrated in-memory SQLite database for tests.
- `src/lib/db.ts` — builds the Drizzle client from `DATABASE_URL` and defaults to the local SQLite file.
- `src/lib/games.ts` — typed helper functions consumed by Astro pages and Vitest tests.

## Schema conventions

- Use `sqliteTable` with explicit column names (`text`, `integer`, `real`).
- Use `integer('id').primaryKey({ autoIncrement: true })` for primary keys.
- Mark required columns with `.notNull()` and leave optional values nullable when needed.
- Use `.references(() => other.id)` for foreign keys.
- Export inferred types (`typeof table.$inferSelect`) and derive app-facing types from them rather than duplicating row shapes by hand.

## Migration workflow

1. Edit `db/schema.ts`.
2. Generate a migration with `npm run db:generate`.
3. Apply and seed locally with `npm run db:setup`.
4. Commit the schema update and the generated migration in `db/migrations/`.

> [!IMPORTANT]
> The database must be migrated and seeded before `astro build`. The `prebuild` and `predev` scripts handle this automatically, and CI depends on that ordering.

## Data-access helper pattern

Helpers should accept the database instance as the first argument so they work against both the real SQLite client and in-memory tests:

```ts
import { asc } from 'drizzle-orm';
import type { Database } from './db';
import { games } from '../../db/schema';

export async function getAllGameIds(db: Database): Promise<number[]> {
  const rows = await db.select({ id: games.id }).from(games).orderBy(asc(games.title));
  return rows.map((row) => row.id);
}
```

- Use `orderBy` on a stable column such as `title` so static pages are deterministic.
- Keep ordering and lookup logic in `src/lib/games.ts`, not in page files.
- Convert raw Drizzle rows into app-facing `Game`, `Publisher`, and `Category` shapes in one place.

## Determinism

Seed-derived values need to be reproducible across builds.

- Derive values like star ratings from a stable hash of the title (`ratingFromTitle`).
- Never use `Math.random()` for seeded data.
- Keep CSV parsing and enrichment pure and testable in `db/transforms.ts`.

## Testing

- Test transforms directly with Vitest.
- Test helper behavior via `createTestDatabase()` and in-memory SQLite.
- Keep fixtures minimal but representative of game → publisher → category relationships.

## Runtime and tooling requirements

- Use Node.js 22.13 or later.
- Keep the built-in `node:sqlite` driver; do not introduce a third-party SQLite driver with binary dependencies.
- Ensure `npm run db:setup` can be run repeatedly without duplicate records or nondeterministic output.

## Type checking

The data layer is type-checked with `npm run typecheck` using the native TypeScript 7 compiler (`tsgo` from `@typescript/native-preview`). Keep exported helpers explicit and strongly typed so the compiler can verify them. ESLint continues to use the classic TypeScript package for linting and static analysis.
