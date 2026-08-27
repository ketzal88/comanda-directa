# Perfit Endpoints Reference

Base URL: `https://api.myperfit.com/v2`

## Common Headers

```
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

API key format: `{accountId}-{secret}` — extract `accountId` as the prefix before the first dash.

## Account Info

### `GET /{accountId}`

Returns account details including plan, contacts, and subscription info.

**Response**:
```json
{
  "data": {
    "code": "abc123",
    "name": "My Store",
    "plan": {
      "state": "active",
      "contacts": { "limit": 10000, "active": 5432 },
      "emails": { "available": 50000 },
      "subscription": {
        "price": {
          "currency": "ARS",
          "total": 15000,
          "totalUSD": 15.50
        }
      }
    }
  }
}
```

## Campaigns

### `GET /{accountId}/campaigns`

**Query Parameters**: `offset=0`, `limit=50`, `sortby=launchDate`, `sortdir=desc`

**Pagination**: Offset-based. Increment `offset` by `limit` until `data.length < limit`.

**Response**:
```json
{
  "data": [
    {
      "id": 12345,
      "name": "Promo Verano",
      "description": "Asunto: 50% OFF en toda la tienda",
      "state": "SENT",
      "type": "regular",
      "launchDate": "2025-01-15T14:30:00-03:00",
      "tags": ["promo", "verano"],
      "recipients": 5000,
      "thumbnail": "https://...",
      "metrics": {
        "sent": 5000,
        "sentP": 100,
        "bounced": 150,
        "bouncedP": 3,
        "opened": 1250,
        "openedP": 25.77,
        "clicked": 320,
        "clickedP": 6.60,
        "conversions": 45,
        "conversionsAmount": 125000
      }
    }
  ]
}
```

### Campaign States

| State | Description |
|---|---|
| `DRAFT` | Not yet scheduled |
| `PENDING_APPROVAL` | Awaiting review |
| `SCHEDULED` | Scheduled for future send |
| `SENT` | Already sent — **filter for this** |
| `CANCELLED` | Cancelled before send |

### Inline Metrics Fields

| Field | Type | Description |
|---|---|---|
| `sent` | number | Total emails sent |
| `sentP` | number | Sent percentage (always 100) |
| `bounced` | number | Total bounces |
| `bouncedP` | number | Bounce rate % |
| `opened` | number | Unique opens |
| `openedP` | number | Open rate % |
| `clicked` | number | Unique clicks |
| `clickedP` | number | Click rate % |
| `conversions` | number | Conversion count |
| `conversionsAmount` | number | Revenue from conversions |

## Automations

### `GET /{accountId}/automations`

No pagination needed — returns all automations in one call.

**Response**:
```json
{
  "data": [
    {
      "id": "auto_abc",
      "name": "Carrito Abandonado",
      "comments": "Reminder after 1h",
      "trigger": "event",
      "enabled": true,
      "tags": ["recovery"],
      "options": {
        "types": ["abandoned_cart"]
      },
      "stats": {
        "triggered": 15000,
        "exited": 500,
        "failed": 20,
        "active": 150,
        "aborted": 100,
        "completed": 14230,
        "converted": 3200,
        "converted_amount": 8500000
      }
    }
  ]
}
```

### Automation Types (via `options.types[]`)

| Type | Description |
|---|---|
| `abandoned_cart` | Cart abandonment recovery |
| `welcome` | Welcome series |
| `visit_recovery` | Browse abandonment |
| `post_purchase` | Post-purchase follow-up |
| `other` | Custom automations |

### Automation Stats

All stats are **lifetime totals** — the API does not provide daily breakdowns for automations.

| Field | Description |
|---|---|
| `triggered` | Total times automation was triggered |
| `exited` | Exited before completion |
| `failed` | Failed to send |
| `active` | Currently in-flight |
| `aborted` | Manually stopped |
| `completed` | Successfully completed flow |
| `converted` | Resulted in conversion |
| `converted_amount` | Revenue from conversions |

## Lists (Listas)

Full reference: https://perfitapiv2.docs.apiary.io/#reference/listas/acciones

### `GET /{accountId}/lists`

Returns all contact lists (segments) for the account.

### `GET /{accountId}/lists/{listId}`

Returns details for a specific list including contact count and metadata.

### `POST /{accountId}/lists/{listId}/contacts`

Add contacts to a list. Body: `{ "email": "..." }` or batch array.

### `DELETE /{accountId}/lists/{listId}/contacts/{contactId}`

Remove a contact from a list.

**Use cases in this project**: could be used to segment audiences by purchase behavior, sync ecommerce customers to Perfit lists, or identify unengaged contacts for list hygiene alerts.

## Important Notes

- **Metrics are inline** — no separate reporting API call needed (unlike Klaviyo).
- **Rates are already percentages** — `openedP: 25.77` means 25.77% (no multiplication needed).
- **`description` contains subject line** — prefixed with "Asunto: ", strip with `.replace(/^Asunto:\s*/i, '')`.
- **Date format**: ISO 8601 with timezone offset (e.g., `-03:00` for Argentina).
- **Filter `state === "SENT"`** client-side to exclude drafts, scheduled, and cancelled campaigns.
- **Automation stats are lifetime only** — cannot be broken down by date range.
- **Daily automation snapshots** — written to `perfit_automation_snapshots/{clientId}__{date}` on every sync to enable period-specific revenue delta computation for monthly reports.