---
name: gads-creative-rotation
description: RSAs underperformers — identifica headlines a pausar. Mutation requiere confirmación.
metadata:
  channel: google_ads
  mutates: true
  autoExec: false
  brainContextRequired: true
---

# gads-creative-rotation

## Goal

Identificar **Responsive Search Ads** (RSAs) y/o ads display con bajo CTR y suficiente exposición para juzgarlos. Sugerir pausados — siempre con confirmación.

## Inputs

```ts
{
  clientId: string;
  windowDays?: number;           // default 30
  ctrThreshold?: number;         // default 0.008 (0.8%)
  minImpressions?: number;       // default 2000
}
```

## Algorithm

1. Resolver `OpsContext`.
2. Correr Q1 (ad performance).
3. Filtrar ads donde:
   - `impressions >= minImpressions`
   - `ctr < ctrThreshold`
   - `ad_group_ad.status = 'ENABLED'`
4. Para cada ad, calcular performance score = `(ctr - threshold) * impressions * cost_share`.
5. Rankear los peores 10 por score.
6. Generar `proposedActions` con `actionType: 'PAUSE_AD'` por cada uno.
7. **Nunca auto-exec.** Pausar un ad puede deteriorar el ad group si no quedan suficientes ads enabled.
8. En la respuesta, indicar **cuántos ads quedarán enabled** en cada ad group post-pause (warn si < 2).

## GAQL Queries

```sql
-- Q1. Ad performance últimos 30d
SELECT
  ad_group_ad.resource_name,
  ad_group_ad.ad.id,
  ad_group_ad.ad.type,
  ad_group_ad.status,
  ad_group.id, ad_group.name,
  campaign.id, campaign.name,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.cost_micros,
  metrics.conversions,
  metrics.average_cpc
FROM ad_group_ad
WHERE segments.date DURING LAST_30_DAYS
  AND ad_group_ad.status = 'ENABLED'
  AND campaign.status = 'ENABLED'
ORDER BY metrics.impressions DESC
LIMIT 500
```

```sql
-- Q2. Count enabled ads por ad group (para chequear post-pause)
SELECT
  ad_group.id,
  ad_group_ad.status,
  ad_group_ad.ad.id
FROM ad_group_ad
WHERE ad_group_ad.status = 'ENABLED'
  AND campaign.status = 'ENABLED'
```

## Output schema

```ts
{
  context: OpsContext;
  totalAdsAnalyzed: number;
  underperformers: Array<{
    adResourceName: string;
    adId: string;
    adType: string;
    campaignName: string;
    adGroupName: string;
    impressions: number;
    ctr: number;
    spend: number;
    conversions: number;
    enabledAdsInGroup: number;
    enabledAdsAfterPause: number;
    warning?: string;   // si quedará < 2 ads enabled
    performanceScore: number;
    suggestedAction: 'PAUSE' | 'KEEP_AND_TEST_REPLACEMENT';
  }>;
  proposedActions: ProposedAction[];  // todas needsConfirmation
}
```

## Auto-exec rules

**Nunca auto-exec.** Toda mutación PAUSE_AD requiere confirmación humana:

```bash
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --confirm=<actionId>
```

Antes de pausar, la skill **siempre** muestra cuántos ads enabled quedarán en el ad group. Si quedan menos de 2, recomienda `KEEP_AND_TEST_REPLACEMENT` en lugar de pause (mejor crear ad nuevo primero, luego pausar).

## Examples

```bash
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=elepants --skill=gads-creative-rotation
```

> **Creative Rotation Elepants — últimos 30d**
>
> 12 RSAs con CTR < 0.8% e impressions > 2k:
>
> Top 5 candidatos a pausar:
> 1. RSA "elepants - col verano" (ad 583921) | CTR 0.42% | impr 18k | 0 conv → PAUSE OK (5 ads quedan)
> 2. RSA "elepants - basicos" (ad 583944) | CTR 0.58% | impr 12k | 1 conv → PAUSE OK (3 ads quedan)
> 3. RSA "elepants - prom oversized" (ad 612133) | CTR 0.72% | impr 5k | 0 conv → ⚠ KEEP_AND_TEST (quedaría 1 ad — crear reemplazo primero)
> ...
>
> Confirmá las que querés pausar.
