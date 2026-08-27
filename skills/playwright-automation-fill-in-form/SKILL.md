---
name: playwright-automation-fill-in-form
description: Use when writing Playwright tests that fill in forms. Covers React controlled components, custom dropdowns, checkbox tricks, file uploads, validation errors, toast notifications, and the 4 main Worker Brain forms.
---

# Playwright: Form Automation

Guide for automating form interactions in Worker Brain's React + Tailwind forms.

## React Controlled Component Gotchas

### Checkboxes — Use `label.click()`

React controlled checkboxes ignore Playwright's `.check()` because the DOM input is controlled by React state. The reliable pattern:

```typescript
// ✓ CORRECT — triggers React onChange via label click
await page.locator('label').filter({ hasText: 'Meta Ads' }).locator('input[type="checkbox"]').click();

// ✗ WRONG — may not trigger React state update
await page.locator('input[type="checkbox"]').check();
```

This is proven in `e2e/admin/client-onboarding.spec.ts`.

### Text Inputs — Use `.fill()` not `.type()`

```typescript
// ✓ CORRECT — clears and sets value, triggers onChange
await page.fill('input[placeholder="e.g. Acme Corp"]', 'My Company');

// ✗ SLOWER — types character by character
await page.locator('input').type('My Company');
```

### Custom Dropdowns (non-native `<select>`)

Worker Brain uses Tailwind dropdown menus, not native `<select>` in some places:

```typescript
// 1. Click the trigger button
await page.locator('button:has-text("Seleccionar")').click();
// 2. Wait for dropdown to appear
await page.locator('[role="listbox"], .absolute').waitFor();
// 3. Click the option
await page.locator('[role="option"]:has-text("Option Text")').click();
```

For native `<select>`:
```typescript
await page.selectOption('select[name="businessType"]', 'ecommerce');
```

## Form Submission with API Wait

Always wait for the API response when submitting:

```typescript
const [response] = await Promise.all([
    page.waitForResponse(resp =>
        resp.url().includes('/api/clients') && resp.request().method() === 'POST'
    ),
    page.locator('button[type="submit"]').click(),
]);
expect(response.status()).toBe(200);
```

## Validation Errors

### Disable HTML5 Validation

To test custom JS validators instead of browser defaults:

```typescript
await page.locator('form').evaluate((f: HTMLFormElement) => { f.noValidate = true; });
```

### Assert Validation Messages

```typescript
// Check for inline error messages
await expect(page.locator('.text-red-500, .text-red-600, [role="alert"]').first()).toBeVisible();

// Check for toast notifications
await expect(page.locator('[data-toast], .toast, [role="status"]').first()).toBeVisible();
```

## Toast/Notification Handling

Worker Brain shows success/error toasts after form actions:

```typescript
// Wait for success toast
await expect(page.locator('text=creado exitosamente, text=guardado')).toBeVisible({ timeout: 5000 });

// Wait for error toast
await expect(page.locator('text=Error, text=error')).toBeVisible({ timeout: 5000 });
```

## The 4 Main Worker Brain Forms

### 1. Client Onboarding — `/admin/clients/new`

| Field | Selector | Type | Notes |
|---|---|---|---|
| Company Name | `input[placeholder="e.g. Acme Corp"]` | text | Required |
| Slug | `input.pl-20` | text | Auto-generated from name |
| Business Type | `select[name="businessType"]` | native select | ecommerce/leads/whatsapp/apps |
| Meta Ads | label > checkbox | checkbox | Use label.click() trick |
| Google Ads | label > checkbox | checkbox | Use label.click() trick |
| Currency | `select[name="currency"]` | native select | USD/ARS/MXN etc. |

**Reference**: `e2e/admin/client-onboarding.spec.ts`

### 2. Lead Entry — `/channels/leads` or `/leads/qualify`

| Field | Selector | Type | Notes |
|---|---|---|---|
| Name | `input[name="name"]` | text | Required |
| Email | `input[name="email"]` | email | Optional |
| Phone | `input[name="phone"]` | tel | Optional |
| Closer | select or dropdown | select | From `leadsConfig.closers` |
| Qualification | radio/select | custom | pending/calificado/no_calificado/spam |

### 3. Blog Brief — `/tools/blog-generator/new`

| Field | Type | Notes |
|---|---|---|
| Client | select | Client selector dropdown |
| Topic/Keyword | text | Main article topic |
| Content Type | select | Pillar/cluster/supplement |

### 4. Spam Check — `/tools/spam-check`

| Field | Type | Notes |
|---|---|---|
| Email selector | dropdown | Picks from test emails |
| Run Check | button | Triggers Postmark + Claude analysis |

## File Upload Pattern

```typescript
const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('input[type="file"]').click(),
]);
await fileChooser.setFiles('/path/to/file.png');
```

## Best Practices

1. **Always mock the API before navigating** — `page.route()` before `page.goto()`
2. **Use shared fixtures** — import from `e2e/fixtures/index.ts`
3. **Wait for networkidle after navigation** — `await page.waitForLoadState('networkidle')`
4. **Use `Promise.all` for submit + response** — avoids race conditions
5. **Tag every test** — `@smoke` minimum, add `@critical` for business flows
