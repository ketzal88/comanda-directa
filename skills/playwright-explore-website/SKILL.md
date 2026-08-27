---
name: playwright-explore-website
description: Use when exploring a Worker Brain page before writing tests. Navigates the page, captures real selectors, documents API calls, loading states, and interactive elements. Produces a JSON recon report that feeds into playwright-generate-test.
---

# Playwright: Explore Website

Navigate a Worker Brain page in the browser to produce a structured recon report. This is a prerequisite for `playwright-generate-test` when the page is complex or unfamiliar.

## Process

### 1. Start the Dev Server

Ensure `npm run dev` is running on `http://localhost:3000`.

### 2. Navigate and Capture

Use the Playwright MCP browser tools (or launch via script):

```typescript
// Navigate to the target page
await page.goto('/target-route');
await page.waitForLoadState('networkidle');
```

### 3. Capture Data Points

Collect the following for the recon report:

#### Headings & Structure
- Main heading (`h1`, `h2`)
- Tab/section navigation
- Breadcrumbs

#### API Calls Made
Monitor network requests during load:
```typescript
const apiCalls: string[] = [];
page.on('request', req => {
    if (req.url().includes('/api/')) {
        apiCalls.push(`${req.method()} ${new URL(req.url()).pathname}`);
    }
});
```

#### Interactive Elements
- Buttons and their labels
- Form inputs (type, placeholder, name)
- Select/dropdown elements
- Tabs, filters, toggles
- Modals/dialogs

#### Loading States
- Skeleton loaders
- Spinner components
- "Loading..." text
- Progressive content reveal

#### What's NOT Testable
- Firestore SDK direct reads (no fetch, can't intercept)
- WebSocket connections
- Client-side only state from `localStorage`

### 4. Output Format

Produce a JSON recon report:

```json
{
    "route": "/channels/leads",
    "pageTitle": "Leads Analytics",
    "heading": "h1: Leads Analytics",
    "apiCalls": [
        "GET /api/clients",
        "GET /api/leads?clientId=xxx",
        "GET /api/channel-snapshots?clientId=xxx&channel=LEADS"
    ],
    "interactiveElements": [
        { "type": "select", "label": "Client Selector", "selector": "select[data-testid='client-select']" },
        { "type": "button", "label": "Analizar con IA", "selector": "button:has-text('Analizar con IA')" },
        { "type": "tab", "labels": ["Funnel", "Timeline", "UTM"], "selector": "[role='tab']" }
    ],
    "loadingStates": [
        { "type": "skeleton", "selector": ".animate-pulse" },
        { "type": "text", "content": "Cargando leads..." }
    ],
    "notTestable": [
        "useClient() hook reads Firestore directly — can't mock via page.route()",
        "useDualSnapshots() — same limitation"
    ],
    "mockableEndpoints": [
        { "endpoint": "/api/leads", "methods": ["GET", "POST", "PATCH"], "responseShape": "{ leads: Lead[], total: number }" },
        { "endpoint": "/api/channel-snapshots", "methods": ["GET"], "responseShape": "{ snapshots: ChannelDailySnapshot[] }" }
    ]
}
```

### 5. Usage

After producing the recon report, feed it to `playwright-generate-test` skill which uses the captured selectors and API calls to generate a complete spec file with appropriate mocks.

### 6. Worker Brain Specifics

- **Client selector**: Most pages have a client dropdown — mock `/api/clients` first
- **Auth bypass**: Dev mode auto-bypasses auth (`middleware.ts` → `isLocalDev`)
- **Stitch Design System**: Tailwind classes, no data-testid on most elements
- **Common patterns**: Cards (`rounded-lg border`), Tables (`<table>`), Modals (`fixed inset-0`), Tabs (`flex border-b`)
