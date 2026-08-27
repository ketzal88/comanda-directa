---
name: gads-quality-score
description: Distribución de Quality Score y keywords prioritarios para mejorar, con razones (relevance / LP / expected CTR).
metadata:
  channel: google_ads
  mutates: false
  autoExec: false
  brainContextRequired: true
---

# gads-quality-score

## Goal

Mostrar la distribución de QS de la cuenta y rankear keywords prioritarios para mejorar — priorizados por **gasto desperdiciado por bajo QS**, no por count. Indica la razón principal de cada QS bajo (creative quality / LP quality / expected CTR).

## Inputs

```ts
{
  clientId: string;
  windowDays?: number;     // default 30
  minSpend?: number;       // default 100 ARS (en currency del cliente)
}
```

## Algorithm

1. Resolver `OpsContext`.
2. Correr Q1 (keywords con QS + sub-scores).
3. Calcular distribución (count por QS 1-10).
4. Calcular **"spend at low QS"**: `Σ cost` de keywords con `QS ≤ 5`.
5. Para cada KW con `QS ≤ 5 AND spend ≥ minSpend`:
   - Identificar componente débil (el sub-score más bajo entre `creative_quality_score`, `post_click_quality_score`, `search_predicted_ctr`).
   - Generar recommendation por componente:
     - `creative_quality_score` bajo → ad copy más relevante al KW
     - `post_click_quality_score` bajo → landing page (carga, contenido, mobile)
     - `search_predicted_ctr` bajo → headlines más persuasivas, asset extensions
6. Ranking final por **(spend * (10 - qs))** = approx ahorro potencial.

## GAQL Queries

```sql
-- Q1. Keywords con QS últimos N días
SELECT
  campaign.id, campaign.name,
  ad_group.id, ad_group.name,
  ad_group_criterion.keyword.text,
  ad_group_criterion.keyword.match_type,
  ad_group_criterion.quality_info.quality_score,
  ad_group_criterion.quality_info.creative_quality_score,
  ad_group_criterion.quality_info.post_click_quality_score,
  ad_group_criterion.quality_info.search_predicted_ctr,
  metrics.cost_micros,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.ctr
FROM keyword_view
WHERE segments.date DURING LAST_30_DAYS
  AND ad_group_criterion.status = 'ENABLED'
  AND campaign.status = 'ENABLED'
ORDER BY metrics.cost_micros DESC
LIMIT 500
```

## Output schema

```ts
{
  context: OpsContext;
  distribution: {
    qs1: number; qs2: number; qs3: number; qs4: number; qs5: number;
    qs6: number; qs7: number; qs8: number; qs9: number; qs10: number;
    unknown: number;
  };
  spendAtLowQs: number;
  pctOfSpendAtLowQs: number;
  priorityKeywords: Array<{
    text: string;
    matchType: string;
    campaignName: string;
    adGroupName: string;
    qs: number;
    spend: number;
    ctr: number;
    conversions: number;
    weakestComponent: 'CREATIVE_QUALITY' | 'POST_CLICK_QUALITY' | 'EXPECTED_CTR';
    componentScores: {
      creative: string;
      postClick: string;
      expectedCtr: string;
    };
    recommendation: string;
    estimatedSaving: number;   // spend * (10 - qs) / 10
  }>;
}
```

## Auto-exec rules

N/A — esta skill no muta.

## Examples

```bash
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=elepants --skill=gads-quality-score
```

> **QS Distribution Elepants**
>
> | QS | Count |
> |---|---|
> | 1-3 | 28 (8%) |
> | 4-5 | 47 (13%) |
> | 6-7 | 124 (35%) |
> | 8-10 | 158 (44%) |
>
> Spend en QS≤5: **$118k/mes (42%)**. Ahorro potencial ≈ $35-50k/mes.
>
> **Top 10 keywords prioritarios:**
> 1. "remera oversized" | QS=3 | spend $14k | weakest: POST_CLICK_QUALITY → revisar LP de categoría oversized (carga lenta?)
> 2. "buzo unisex" | QS=4 | spend $8.5k | weakest: EXPECTED_CTR → headlines más fuertes con beneficio
> ...
