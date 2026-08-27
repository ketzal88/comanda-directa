# Perfit Data Patterns

## Account ID Extraction

API key format is `{accountId}-{secret}`. Extract account ID:

```typescript
const dashIdx = apiKey.indexOf('-');
const accountId = apiKey.substring(0, dashIdx);
```

The account ID is used as a path segment in all API calls: `/{accountId}/campaigns`.

## Client-Side Date Filtering

The API doesn't support date range filtering — fetch ALL sent campaigns, then filter client-side:

```typescript
const inRange = campaigns.filter(c => {
    const launch = c.launchDate?.split("T")[0];
    return launch && launch >= startDate && launch <= endDate;
});
```

## Subject Line Extraction

Campaign subject lives in `description` field, prefixed with "Asunto: ":

```typescript
const subject = campaign.description?.replace(/^Asunto:\s*/i, '') || campaign.name;
```

## Daily Aggregation

Group campaigns by `launchDate` date portion for daily breakdown:

```typescript
const date = campaign.launchDate.split("T")[0]; // "2025-01-15"
```

This gives actual per-day granularity (unlike Klaviyo which returns period totals).

## Metric Calculations

Perfit returns raw counts — compute rates from delivered:

```typescript
delivered = sent - bounced
openRate = delivered > 0 ? (opens / delivered) * 100 : 0
clickRate = delivered > 0 ? (clicks / delivered) * 100 : 0
clickToOpenRate = opens > 0 ? (clicks / opens) * 100 : 0
revenuePerRecipient = sent > 0 ? conversionsAmount / sent : 0
```

Note: `openedP`/`clickedP` from API are pre-computed but we recalculate from delivered count for consistency.

## Automation Lifetime Totals

Automation stats are **lifetime only** — stored alongside every daily snapshot:

```typescript
automationTotals = {
    totalConverted: sum(enabledAutomations.converted),
    totalConvertedAmount: sum(enabledAutomations.convertedAmount),
    totalTriggered: sum(enabledAutomations.triggered),
    totalCompleted: sum(enabledAutomations.completed),
};
```

Only enabled automations are included in totals.

## rawData Structure

```typescript
rawData: {
    campaigns: PerfitCampaignDetail[],     // Per-campaign breakdown for the day
    automations: PerfitAutomationSummary[], // All automation summaries (lifetime)
    automationTotals: {
        totalConverted: number,
        totalConvertedAmount: number,
        totalTriggered: number,
        totalCompleted: number,
    },
    account: {                              // Account info (nullable)
        name: string,
        activeContacts: number,
        contactLimit: number,
        planState: string,
        monthlyCost: number,
        currency: string,
    },
    source: 'perfit',
}
```

## DNS / Deliverability Configuration (Perfit)

DNS records required on the **root domain** (e.g. `marca.com.ar`):

| Record | Type | Value |
|--------|------|-------|
| SPF | TXT en raíz | `v=spf1 include:spf.myperfit.com ~all` |
| DKIM | CNAME en `perfit._domainkey.marca.com.ar` | Valor del panel Perfit → Configuración → Autenticación DKIM |
| DMARC | TXT en `_dmarc.marca.com.ar` | `v=DMARC1; p=none; rua=mailto:dmarc@marca.com.ar` |

**DKIM selector**: `perfit`

**DMARC progression**: `p=none` (30-90d monitoring) → `p=quarantine` → `p=reject` (BIMI-eligible)

**MX**: Only needed on root domain for bounce handling — NOT required on sending subdomains.

**Google/Yahoo 2024 bulk sender requirements** (>5K emails/day to Gmail/Yahoo):
- SPF + DKIM + DMARC (at least p=none) mandatory
- One-click unsubscribe honored within 2 days
- Spam complaint rate < 0.1%

## Comparison with Klaviyo

| Aspect | Perfit | Klaviyo |
|---|---|---|
| Metrics location | Inline with campaign object | Separate reporting API |
| Rate limits | Standard API limits | 2/min, 225/day for reporting |
| Date filtering | Client-side | Server-side (timeframe param) |
| Daily granularity | Yes (via launchDate) | No (period totals only) |
| Automation stats | Lifetime totals | Period-filtered |
| Rate format | Already percentages | Decimals (0-1) |
| Revenue field | `conversionsAmount` | `conversion_value` |
| Pagination | Offset-based | JSON:API cursor-based |
| DKIM selector | `perfit` | `kl` |
| SPF include | `spf.myperfit.com` | `send.klaviyo.com` |
| DNS setup | Manual (all records) | Auto via Branded Sending Domain (NS/CNAME) |

## Sync Strategy

1. Fetch all sent campaigns (offset pagination)
2. Filter by date range client-side
3. Group by launch date → daily aggregates
4. Fetch automations in parallel (single call, no pagination)
5. Fetch account info in parallel (optional, `.catch(() => null)`)
6. Write daily snapshots via Firestore batch (max 500 per batch)