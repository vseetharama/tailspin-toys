---
description: 'Central UI strategy and component development philosophy for Tailspin Toys'
---

# UI Component Strategy

This file defines the shared UI strategy for Tailspin Toys. The app is a static Astro storefront with Tailwind-based styling and no client-side UI framework, so the UI should stay simple, semantic, and testable.

## Component architecture

### Technology separation

- **Astro** (`.astro` files): pages, layouts, components, routing, and static content
- **Tailwind CSS**: styling via utility classes and dark theme tokens
- **Astro `<script>`**: only for genuine client-side behavior; otherwise use plain HTML and CSS

Refer to the repo's technology-specific instruction files:
- [`astro.instructions.md`](astro.instructions.md)
- [`style.instructions.md`](style.instructions.md)
- [`playwright.instructions.md`](playwright.instructions.md)

## Core principles

### Testability

- Every interactive element should include a `data-testid` attribute.
- Use descriptive IDs that reflect purpose and context, for example `data-testid="game-card-{game.id}"` or `data-testid="nav-home"`.
- Keep selectors stable and tied to the user's intent rather than implementation details.

### Accessibility

- Use semantic elements such as `<nav>`, `<main>`, `<article>`, `<button>`, and `<a>`.
- Add ARIA labels or roles only when the native element is not sufficient.
- Avoid custom menu semantics unless the component truly implements full roving-focus keyboard behavior.
- Use `role="status"` and `aria-live="polite"` for loading or status updates.
- Include focus rings and keyboard support for all interactive controls.
- Maintain strong color contrast for dark-theme text and controls.

### Design consistency

- Keep the application in a dark theme throughout.
- Use modern, rounded cards and readable spacing.
- Keep visual hierarchy, content density, and interaction patterns consistent across the site.
- Favor responsive layout behavior over fixed-width assumptions.

### Reusability

- Build small, focused components with clear responsibilities.
- Pass data via props rather than duplicating markup across pages.
- Keep component APIs typed and easy to understand.

## Development workflow

1. Choose the right layer for the job:
   - Content structure → Astro components/pages
   - Styling → Tailwind utility classes
   - Client behavior → a small scoped Astro script only if genuinely needed

2. Follow the repo instruction files for the specific layer being changed.

3. Ensure the UI remains visible, accessible, and testable.

4. Validate the change with the relevant test or quality-check workflow before finishing.
