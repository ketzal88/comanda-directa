---
name: gads-wasted-spend
description: Keywords con $$ y 0 conversiones en últimos 30d. Auto-aplica negatives ultra-obvios.
metadata:
  channel: google_ads
  mutates: true
  autoExec: true
  brainContextRequired: true
---

# gads-wasted-spend

## Goal

Variante más agresiva de `gads-search-terms` enfocada en **keywords directos** (no search terms) que están quemando plata sin convertir. Auto-exec con threshold más estricto (`spend > 3x targetCpa` vs 2x del search-terms), última semana, para minimizar riesgo.

## Inputs

```ts
{
  clientId: string;
  windowDays?: number;        // default 7 (más conservador)
  matchType?: 'EXACT' | 'PHRASE' | 'BROAD';  // default 'EXACT'
}
```

## Algorithm

1. Resolver `OpsContext`. Falla si no hay `targetCpa`.
2. Correr Q1: keywords con `cost > 0 AND conversions = 0`.
3. Filtrar candidatos:
   - `conversions == 0`
   - `cost > 3 * targetCpa`
   - `clicks >= 30` (señal de que se invirtió en clicks suficientes)
4. Para cada candidato:
   - Si pasa auto-exec rules → aplicar `addNegativeKeyword` con scope `AD_GROUP` (no campaign — más quirúrgico).
   - Sino → `needsConfirmation`.
5. Loggear todo en `google_ads_actions`.

## GAQL Queries

```sql
-- Q1. Keywords quemando sin convertir
SELECT
  ad_group_criterion.criterion_id,
  ad_group_criterion.keyword.text,
  ad_group_criterion.keyword.match_type,
  ad_group.id, ad_group.name,
  campaign.id, campaign.name,
  metrics.cost_micros,
  metrics.clicks,
  metrics.conversions,
  metrics.impressions
FROM keyword_view
WHERE segments.date DURING LAST_7_DAYS
  AND ad_group_criterion.status = 'ENABLED'
  AND campaign.status = 'ENABLED'
  AND metrics.cost_micros > 0
HAVING metrics.conversions = 0
ORDER BY metrics.cost_micros DESC
LIMIT 200
```

## Output schema

```ts
{
  context: OpsContext;
  totalCandidates: number;
  totalWastedSpend: number;
  executedActions: ExecutedAction[];
  needsConfirmation: ProposedAction[];
  skipped: Array<{
    keyword: string;
    reason: string;
  }>;
}
```

## Auto-exec rules

Auto-exec requiere TODAS:

- `conversions == 0`
- `cost > 3 * targetCpa`
- `clicks >= 30`
- `windowDays = 7` (no más, no menos)

`matchType` default `EXACT`. Scope de negative: `AD_GROUP` (no escala globalmente).

## Examples

```bash
# Analyze
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=elepants --skill=gads-wasted-spend --mode=analyze

# Execute con auto-exec
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=elepants --skill=gads-wasted-spend --mode=execute
```

> **Wasted Spend Elepants (últimos 7d, target $1,200)**
>
> 8 keywords gastando sin convertir, total $48k ARS quemado:
>
> Auto-applied:
> - "remeras hombre baratas" (Search Genéricas) | $9.8k / 0 conv → negative EXACT en ad group
> - "buzos sin estampa" (Search Catálogo) | $7.2k / 0 conv → negative EXACT en ad group
>
> Needs confirmation:
> - "elepants" (Search Brand) — alto spend pero es marca, requiere review humana
> - "remera oversized" — bajo clicks (15), umbral no alcanzado
