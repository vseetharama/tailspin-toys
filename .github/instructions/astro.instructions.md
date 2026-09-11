---
description: 'Astro component patterns for the Tailspin Toys static storefront'
applyTo: '**/*.astro'
---

# Astro Component Instructions

Tailspin Toys is a single Astro 7 site with static output only. Pages are prerendered at build time, the data is loaded from the local SQLite database in frontmatter, and there is no separate backend API or client-side app framework.

## Project constraints

- Use `output: 'static'` conventions throughout the app.
- Keep data access in frontmatter and let build-time helpers resolve the SQLite records.
- Avoid client-side fetching or app state management unless a feature truly requires a small scoped script.
- Prefer semantic HTML, accessible defaults, and keyboard-friendly native controls.
- Add `data-testid` to every interactive element and use descriptive names tied to purpose.

## Component structure

```astro
---
import Layout from '../layouts/Layout.astro';
import GameCard from '../components/GameCard.astro';
import { getDatabase } from '../lib/db';
import { getAllGames } from '../lib/games';

interface Props {
  title: string;
}

const { title } = Astro.props;
const games = await getAllGames(getDatabase());
---

<Layout title={title}>
  {games.map((game) => <GameCard game={game} />)}
</Layout>
```

- Keep component logic in frontmatter and keep reusable UI pieces in `src/components/`.
- Use typed props and exported interfaces when a component accepts data.
- Do not call database helpers from the browser or from runtime endpoints.

## Layouts

- Create shared layouts under `src/layouts/`.
- Use `<slot />` for page content.
- Include the standard document shell, metadata, and global CSS import.
- Keep navigation and footer wrappers consistent across pages.

## Pages and routing

- Create pages in `src/pages/` using file-based routing.
- Dynamic routes need `getStaticPaths()` plus `export const prerender = true`.
- Provide a branded `src/pages/404.astro` for unknown routes.
- Keep pages focused on composition; database and transforms live in `src/lib/` and `db/`.

```astro
---
import type { GetStaticPaths } from 'astro';
import Layout from '../../layouts/Layout.astro';
import { getDatabase } from '../../lib/db';
import { getAllGameIds, getGameById } from '../../lib/games';

export const prerender = true;

export const getStaticPaths = (async () => {
  const ids = await getAllGameIds(getDatabase());
  return ids.map((id) => ({ params: { id: String(id) } }));
}) satisfies GetStaticPaths;

const { id } = Astro.params;
const game = await getGameById(getDatabase(), Number(id));
---

<Layout title="Game Details - Tailspin Toys">
  <!-- Game detail content -->
</Layout>
```

## Data access

- Use `getDatabase()` from `src/lib/db.ts` and typed helpers such as `getAllGames` and `getGameById` from `src/lib/games.ts`.
- The database is populated before `dev` and `build` via the `predev` and `prebuild` scripts.
- Keep read logic in `src/lib/` and return app-facing types rather than raw Drizzle rows.

## Client interactivity

This app is intentionally minimal on the client side.

- Prefer native controls: `<a>`, `<button>`, `<input>`, `<form>`.
- Use a scoped Astro `<script>` only when real client-side behavior is required.
- Keep scripts small and event-focused; avoid introducing a UI framework.
- Always preserve keyboard access and visible focus styles.

## TypeScript

- Type props and helper return values explicitly.
- Define `Props` interfaces in frontmatter for component inputs.
- Run `npx astro sync` before linting or type-checking so Astro-generated types are current.
- `.astro` files are checked by `npm run typecheck:astro` and pure TypeScript by `npm run typecheck`.

## Quality bar

- Keep frontmatter data fetching in build-time code paths.
- Keep the UI accessible and readable in the required dark theme.
- Use the repository's Tailwind patterns and never add heavy client-only UI layers.
- Follow the repository instruction files before writing code.
