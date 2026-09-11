---
description: 'Vitest unit test guidelines for the Astro + Drizzle data layer'
applyTo: '**/*.test.ts'
---

# Unit Testing Guidelines (Vitest + Drizzle/Node SQLite)

Unit tests run with **Vitest** and cover the parts of the project that are framework-free and highest-value:

1. Pure transforms in `db/transforms.ts` (CSV parsing, derived values, deduplication, deterministic ratings)
2. Data-access helpers in `src/lib/games.ts` against a real in-memory SQLite database

> [!IMPORTANT]
> Keep tests isolated from the Astro runtime. Helper functions accept an injectable database argument; tests pass an in-memory database while pages pass the real client. Do not start the Astro server to unit test the data layer.

## File structure

- Co-locate tests with the code, for example `transforms.test.ts` beside `transforms.ts` and `games.test.ts` beside `games.ts`.
- Follow the pattern `<module>.test.ts`.
- Use `describe('<module or function>')` and `it('does X when Y')` naming.
- Add explicit types for fixtures and helper return values.

## Testing pure transforms

- Import the transform functions directly; there is no need for a database.
- Cover happy paths, empty values, missing optional fields, deduplication, and deterministic behavior.
- Prefer `it.each` for small input/output matrices.

```ts
import { describe, expect, it } from 'vitest';
import { ratingFromTitle } from './transforms';

describe('ratingFromTitle', () => {
  it('is deterministic and stays in range', () => {
    const a = ratingFromTitle('Code Quest');
    const b = ratingFromTitle('Code Quest');

    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(3.0);
    expect(a).toBeLessThanOrEqual(5.0);
  });
});
```

## Testing data-access helpers

- Use the shared `createTestDatabase()` helper from `db/test-helpers.ts` to build a fresh `:memory:` database for each test.
- Seed only the rows the test needs.
- Assert the cheap/meaningful state first (counts, ordering, presence of relations) before checking deep object shapes.

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { getAllGames, getGameById } from './games';

describe('getAllGames', () => {
  let db: Awaited<ReturnType<typeof createTestDatabase>>;

  beforeEach(async () => {
    db = await createTestDatabase();
    // seed minimal publishers, categories, games
  });

  it('returns games ordered by title', async () => {
    const games = await getAllGames(db);
    const titles = games.map((game) => game.title);

    expect(titles).toEqual([...titles].sort());
    expect(games[0]?.category).not.toBeNull();
  });
});
```

## Required coverage

- Valid success cases
- Not-found cases (`getGameById` returns `null`)
- Empty collection/database scenarios
- Sorting by title for deterministic build output
- Deterministic derived values from stable titles

## Best practices

- Follow Arrange-Act-Assert.
- Keep one behavior per test case.
- Avoid mocking the database; a real in-memory SQLite database exercises the SQL and joins accurately.
- Keep fixtures minimal but representative of the real game -> publisher -> category relationships.
- Regenerate migrations with `npm run db:generate` when schema changes break tests.

## Validation

Run unit tests through the project's quality-check workflow rather than ad hoc commands.
