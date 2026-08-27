---
name: playwright-generate-test
description: Use when generating a new Playwright E2E spec for a Worker Brain page. Reads source, identifies API calls, generates spec with shared fixtures, page.route() mocks, and proper tags (@smoke/@critical/@api/@auth).
---

# Playwright: Generate Test Spec

Generate a complete Playwright E2E spec for a Worker Brain page.

## Process

### 1. Identify the Page Source

Read the page component to understand:
- **Route**: The Next.js App Router path (e.g., `src/app/(brain)/channels/leads/page.tsx`)
- **API calls**: `fetch('/api/...')` calls or custom hooks like `useClient()`, `useDualSnapshots()`
- **States**: loading, empty, error, populated data

### 2. Classify What's Interceptable

| Pattern | Interceptable via `page.route()`? | Strategy |
|---|---|---|
| `fetch('/api/...')` from client component | YES | `page.route('**/api/endpoint**', ...)` |
| `useEffect` + fetch | YES | Same as above |
| Server component `fetch()` | NO | Run against real dev server |
| Firestore SDK direct from hooks (`useClient`) | NO | Relies on dev Firestore or skip |

### 3. Generate the Spec

Follow this template:

```typescript
/**
 * E2E Tests: [Page Name] — [Route]
 *
 * [Brief description of what's tested]
 * All API calls mocked via page.route() — no real Firebase/Meta needed.
 *
 * Tags: @smoke [@critical] [@api] [@auth]
 */
import { test, expect } from '@playwright/test';
import { MOCK_CLIENT, mockClientsAPI, ... } from '../fixtures';

test.describe('[Page Name] @smoke', () => {

    test.beforeEach(async ({ page }) => {
        await mockClientsAPI(page);
        // Mock page-specific APIs
        await page.route('**/api/specific-endpoint**', route =>
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({...}) })
        );
    });

    test('page loads without crash', async ({ page }) => {
        await page.goto('[route]');
        await page.waitForLoadState('networkidle');
        const body = await page.locator('body').textContent();
        expect(body?.length).toBeGreaterThan(0);
    });

    test('shows expected heading or key element', async ({ page }) => {
        await page.goto('[route]');
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('empty state when no data', async ({ page }) => {
        await page.route('**/api/specific**', route =>
            route.fulfill({ status: 200, body: JSON.stringify({ items: [] }) })
        );
        await page.goto('[route]');
        // Assert empty state message
    });
});
```

### 4. Fixture Usage Rules

- **ALWAYS** import from `e2e/fixtures/index.ts` — never inline mock data
- If a new mock type is needed, **add it to fixtures first**, then use it
- Use typed mocks that match `src/types/` interfaces so TypeScript catches drift
- Use `mockClientsAPI(page)` as base for every page that needs client context

### 5. Tagging Rules

| Tag | When to Use | Run Command |
|---|---|---|
| `@smoke` | Every spec — fast, basic health check | `npm run test:e2e:smoke` |
| `@critical` | Business-critical flows (CRM, billing, generation) | `npm run test:e2e:critical` |
| `@api` | No browser needed — API-level tests | `npm run test:e2e:api` |
| `@auth` | Tests auth redirect/bypass behavior | N/A |

### 6. Reference Spec

See `e2e/admin/client-onboarding.spec.ts` for the canonical example:
- React checkbox trick: `label.click()` instead of `.check()`
- `slugInput` custom selector for prefix-padded inputs
- `disableHtml5Validation()` helper
- `setupBaseMocks()` as beforeEach pattern

### 7. What NOT to Test

- Firestore SDK reads from hooks (`useClient`, `useDualSnapshots`) — not interceptable
- Real AI generation (Claude/Gemini) — too slow and nondeterministic
- Real Meta/Google API responses — use manual `playwright.meta-review.config.ts` for that
