---
name: gads-audit-account
description: Auditoría completa de cuenta Google Ads para clientes del Brain. Identifica top 5 fixes priorizados.
metadata:
  channel: google_ads
  mutates: false
  autoExec: false
  brainContextRequired: true
---

# gads-audit-account

## Goal

Producir un reporte estructurado del estado de la cuenta Google Ads de un cliente. Diagnostica: estructura de cuenta, salud de conversion tracking, distribución de Quality Score, top wasted-spend campaigns, y devuelve **Top 5 fixes priorizados** con accionables concretos.

Es read-only — no muta nada. Vos decidís qué aplicar después con las skills mutadoras.

## Inputs

```ts
{
  clientId: string;          // Brain client doc id o slug
  windowDays?: number;       // default 30
}
```

## Algorithm

1. Resolver `OpsContext` desde `clientId`: customerId, loginCustomerId (MCC), currency, targetCpa.
2. Correr GAQL queries en paralelo (ver §GAQL Queries).
3. Calcular indicadores:
   - **Account structure**: count(campaigns activas), count(ad groups), count(ads), count(keywords).
   - **Conversion tracking health**: hay conversions reportadas en últimos 7d? Si no → CRITICAL.
   - **QS distribution**: cuántas keywords tienen QS < 5 entre top 100 por spend.
   - **Wasted spend**: top 5 campaigns con `cost > 2 * targetCpa AND conversions = 0` en windowDays.
   - **Impression share lost**: campaigns con `search_budget_lost_impression_share > 0.30` (perdiendo >30% por budget).
4. Producir `topFixes`: rankeados por `(impacto_estimado_ars, urgencia)`.

## GAQL Queries

```sql
-- Q1. Account structure
SELECT
  campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
  metrics.cost_micros, metrics.conversions, metrics.impressions
FROM campaign
WHERE campaign.status = 'ENABLED'
  AND segments.date DURING LAST_30_DAYS
```

```sql
-- Q2. Quality Score distribution (top 100 keywords por spend)
SELECT
  ad_group_criterion.keyword.text,
  ad_group_criterion.quality_info.quality_score,
  ad_group_criterion.quality_info.creative_quality_score,
  ad_group_criterion.quality_info.post_click_quality_score,
  ad_group_criterion.quality_info.search_predicted_ctr,
  metrics.cost_micros,
  metrics.impressions,
  metrics.clicks
FROM keyword_view
WHERE segments.date DURING LAST_30_DAYS
  AND ad_group_criterion.status = 'ENABLED'
  AND campaign.status = 'ENABLED'
ORDER BY metrics.cost_micros DESC
LIMIT 100
```

```sql
-- Q3. Impression share signals
SELECT
  campaign.id, campaign.name,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share,
  metrics.cost_micros
FROM campaign
WHERE campaign.status = 'ENABLED'
  AND segments.date DURING LAST_7_DAYS
```

```sql
-- Q4. Wasted spend (campaigns con 0 conv)
SELECT
  campaign.id, campaign.name,
  metrics.cost_micros, metrics.conversions, metrics.impressions, metrics.clicks
FROM campaign
WHERE campaign.status = 'ENABLED'
  AND segments.date DURING LAST_30_DAYS
HAVING metrics.conversions = 0 AND metrics.cost_micros > 0
ORDER BY metrics.cost_micros DESC
LIMIT 20
```

## Output schema

```ts
{
  context: {
    clientId: string;
    customerId: string;
    currency: 'ARS' | 'USD' | ...;
    targetCpa?: number;
    windowDays: number;
  };
  structure: {
    activeCampaigns: number;
    activeAdGroups: number;
    activeAds: number;
    activeKeywords: number;
  };
  trackingHealth: {
    conversionsLast7d: number;
    status: 'HEALTHY' | 'NO_CONVERSIONS' | 'NO_TRACKING';
  };
  qualityScore: {
    distribution: { qs1: number; qs2: number; ...; qs10: number };
    lowQsKeywords: Array<{ text: string; qs: number; spend: number }>;
  };
  wastedSpend: Array<{
    campaignId: string;
    campaignName: string;
    spend: number;
    clicks: number;
    impressions: number;
    reason: string;
  }>;
  impressionShareIssues: Array<{
    campaignId: string;
    campaignName: string;
    lostByBudget: number;
    lostByRank: number;
    spend: number;
    suggestedAction: 'INCREASE_BUDGET' | 'IMPROVE_BIDS' | 'IMPROVE_AD_RANK';
  }>;
  topFixes: Array<{
    rank: number;
    title: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedSavingArs?: number;
    action: string;
    suggestedSkill?: 'gads-search-terms' | 'gads-wasted-spend' | 'gads-budget-triage' | 'gads-quality-score' | 'gads-creative-rotation';
  }>;
}
```

## Auto-exec rules

N/A — esta skill no muta.

## Examples

```bash
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=elepants --skill=gads-audit-account
```

Esperado: JSON con structure / trackingHealth / qualityScore / wastedSpend / topFixes.

El consumidor (Claude en CLI / panel en UI) traduce a un reporte humano:

> **Auditoría Elepants — últimos 30 días**
>
> Estructura: 12 campañas activas, 48 ad groups, 320 ads, 1,840 keywords.
> Conversion tracking: ✓ 187 conv. últimos 7d.
> Quality Score: 23 keywords con QS<5 quemando $48,000 ARS/mes.
>
> **Top 5 fixes:**
> 1. (HIGH, $32k ARS/mes ahorrable) Pausar 8 search terms con 0 conv + $4k+ spend
> 2. (HIGH) Aumentar budget en "Performance Max - Productos" (perdiendo 47% por budget)
> 3. (MEDIUM) Revisar QS de "remera oversized" (QS=3, $12k/mes)
> ...
