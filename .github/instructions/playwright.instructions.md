---
description: 'Playwright E2E test guidance for the Tailspin Toys storefront'
applyTo: '**/*.spec.ts'
---

# Playwright Test Writing Guidelines

Run the end-to-end suite through the project's quality-check workflow rather than invoking Playwright directly. For Tailspin Toys, E2E tests validate the static storefront the same way a user experiences it in the browser.

## Code quality standards

- Prefer user-facing, role-based locators such as `getByRole`, `getByLabel`, and `getByText`.
- Use `test.step()` to group interactions and make failures easier to diagnose.
- Use web-first, auto-retrying assertions such as `await expect(locator).toHaveText()`, `toContainText()`, `toHaveURL()`, `toHaveCount()`, and `toMatchAriaSnapshot()`.
- Avoid hard-coded waits like `waitForTimeout()`, longer default timeouts, or `waitForLoadState()`.
- Keep test names and step names descriptive and tied to the user behavior under test.

## Test structure

- Start each file with `import { test, expect } from '@playwright/test';`.
- Group related scenarios in `test.describe()` blocks.
- Use `beforeEach()` for shared setup such as navigating to the relevant page.
- Store feature specs in `e2e-tests/` and follow the pattern `<feature-or-page>.spec.ts`.

## Assertion best practices

- Use accessibility snapshots for structure-heavy UI verification.
- Use `toHaveCount` when the number of matching elements matters.
- Use `toHaveText` for exact expectations and `toContainText` for partial matches.
- Use `toHaveURL` for route verification and navigation checks.
- Only use `toBeVisible()` when visibility itself is the meaningful condition.

## Example

```ts
import { test, expect } from '@playwright/test';

test.describe('Game listing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4321');
  });

  test('shows a visible list of games', async ({ page }) => {
    await test.step('Open the home page', async () => {
      await expect(page.getByRole('heading', { name: 'Tailspin Toys' })).toBeVisible();
    });

    await test.step('Verify game cards are rendered', async () => {
      await expect(page.getByRole('link', { name: /.+/ })).toHaveCount(8);
    });
  });
});
```

## Authoring and iteration strategy

1. Run the suite through the `quality-checks` skill.
2. Diagnose failures by inspecting the DOM, route, and assertion output.
3. Refine locators and assertions until they reflect real user intent.
4. Re-run targeted validation and confirm the feature is stable.

## Quality checklist

Before finalizing a spec, confirm that:
- all locators are user-facing and resilient
- the test reflects actual storefront behavior
- assertions verify meaningful state rather than incidental markup
- the file is in `e2e-tests/` and follows repo naming conventions
- no hard-coded waits or brittle selectors were introduced
