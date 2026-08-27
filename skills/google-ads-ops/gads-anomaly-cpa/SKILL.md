---
name: gads-anomaly-cpa
description: Diagnostica un spike de CPA comparando vs semana anterior. Breakdown por campaña/device/dayOfWeek + lectura de channel_snapshots.
metadata:
  channel: google_ads
  mutates: false
  autoExec: false
  brainContextRequired: true
---

# gads-anomaly-cpa

## Goal

Cuando el CPA pega un salto, esta skill responde **qué cambió y por qué** comparando últimos 7 días vs los 7 anteriores. Cruza datos vivos con `channel_snapshots` para baseline histórico.

## Inputs

```ts
{
  clientId: string;
  windowDays?: number;        // default 7 (current week vs previous)
}
```

## Algorithm

1. Resolver `OpsContext`.
2. Leer baseline desde `channel_snapshots` últimos 14 días GOOGLE.
3. Calcular CPA actual (`spend / conversions`) vs CPA semana anterior. Si delta < 15% → reportar "no anomaly", terminar.
4. Si delta ≥ 15% → ejecutar las 4 queries de breakdown en paralelo.
5. Para cada dimensión (campaign, device, dayOfWeek, ad), calcular CPA delta y rankear por **contribution to total spike** (`delta_spend_share * delta_cpa_pct`).
6. Identificar drivers principales (top 3 por contribución).
7. Generar hipótesis textual: ej "Mobile CPA +85% vs DESKTOP estable → revisar landing mobile" o "Campaña 'X' agotó budget el martes, perdió mejores conversiones".

## GAQL Queries

```sql
-- Q1. Daily totals últimos 14 días
SELECT
  segments.date,
  metrics.cost_micros, metrics.conversions, metrics.clicks, metrics.impressions
FROM customer
WHERE segments.date DURING LAST_14_DAYS
```

```sql
-- Q2. By campaign últimos 14 días
SELECT
  segments.date, campaign.id, campaign.name,
  metrics.cost_micros, metrics.conversions
FROM campaign
WHERE segments.date DURING LAST_14_DAYS
  AND campaign.status = 'ENABLED'
```

```sql
-- Q3. By device últimos 14 días
SELECT
  segments.date, segments.device,
  metrics.cost_micros, metrics.conversions
FROM customer
WHERE segments.date DURING LAST_14_DAYS
```

```sql
-- Q4. By day of week (server-side calculado desde Q1)
```

## Output schema

```ts
{
  context: OpsContext;
  current: { spend: number; conversions: number; cpa: number };
  previous: { spend: number; conversions: number; cpa: number };
  delta: { spendPct: number; conversionsPct: number; cpaPct: number };
  isAnomalous: boolean;          // cpaPct >= 15%
  drivers: Array<{
    dimension: 'campaign' | 'device' | 'dayOfWeek' | 'ad';
    label: string;
    currentCpa: number;
    previousCpa: number;
    deltaPct: number;
    spendShare: number;
    contributionScore: number;    // ranking
    hypothesis: string;
  }>;
  baselineFromSnapshots: {
    avgCpa30d: number;            // de channel_snapshots
    stdDevCpa30d: number;
    zScore: number;
  };
  recommendation: string;
}
```

## Auto-exec rules

N/A — esta skill no muta.

## Examples

```bash
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=elepants --skill=gads-anomaly-cpa
```

Output esperado (interpretado):

> **CPA Elepants: $2,840 ARS (+62% vs semana anterior $1,750)**
>
> z-score vs últimos 30d: **+2.4σ** → anomalía.
>
> Drivers principales:
> 1. **Mobile CPA +85%** (espacio: 68% del spend mobile). Hipótesis: posible problema en landing mobile o competidor agresivo en mobile.
> 2. **"Performance Max - Productos" CPA +47%**. Hipótesis: cambio de audience signal o agotamiento de budget mid-week.
> 3. **Día martes CPA 2.1x el promedio**. Hipótesis: evento externo (sin paralelo en histórico).
>
> Recomendación: chequear landing mobile + revisar audience signal de PMax.
