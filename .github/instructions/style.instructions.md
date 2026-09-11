---
description: 'Tailwind CSS v4 styling rules for Tailspin Toys'
applyTo: '**/*.{astro,css}'
---

# Tailwind CSS Instructions

Tailspin Toys uses Tailwind CSS v4 and a dark theme throughout the storefront. Styling should reinforce the brand while staying clean, readable, and fully accessible.

## Tailwind setup

- Use Tailwind via the `@tailwindcss/vite` integration.
- Import Tailwind in the global stylesheet with `@import "tailwindcss";`.
- Prefer utility classes over custom CSS unless a small component-level rule is clearly needed.
- Do not add a separate `tailwind.config.js` unless the project explicitly requires it.

## Dark theme requirements

All UI should default to a dark palette anchored on slate colors:

- Backgrounds: `bg-slate-800`, `bg-slate-900`, `bg-slate-950`
- Text: `text-slate-100`, `text-slate-200`, `text-slate-300`
- Borders: `border-slate-700`, `border-slate-600`
- Accent and hover states: blue or neutral variants that keep contrast readable

## Common patterns

- Card containers: `bg-slate-800 rounded-xl p-6 shadow-lg`
- Hover states: `hover:bg-slate-700 transition-colors duration-200`
- Borders: `border border-slate-700`
- Gradients: `bg-gradient-to-br from-slate-800 to-slate-900`
- Backdrop overlays: `backdrop-blur-sm bg-slate-900/50`

## Layout and responsiveness

- Use mobile-first responsive utilities (`sm:`, `md:`, `lg:`, `xl:`).
- Keep spacing and typography consistent across cards, tables, and detail pages.
- Prefer readable text scaling and clear hierarchy over decorative complexity.

## Accessibility and states

- Use visible focus styles such as `focus:ring-2 focus:ring-blue-500 focus:outline-none`.
- Ensure sufficient contrast for text, links, and controls.
- Preserve keyboard behavior on all interactive elements.
- Avoid color-only meaning for state changes; pair it with text or icons when needed.

## Styling philosophy

- Prefer small, composable utilities over large custom CSS rule sets.
- Group classes by layout, spacing, color, and interaction in readable order.
- Keep the UI consistent with the rest of the app and avoid one-off visual styles that break the dark theme.
- Follow the repo's pattern of using semantic HTML and utility classes rather than a UI framework.
