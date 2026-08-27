---
name: gads-cannibalization
description: Cross-campaign keyword overlap. Identifica canibal por gasto.
metadata:
  channel: google_ads
  mutates: false
  autoExec: false
  brainContextRequired: true
---

# gads-cannibalization

## Goal

Detectar **keywords que compiten contra sí mismas** entre campañas distintas de la misma cuenta. Cada vez que dos campañas pujan por el mismo query, el primero gana pero **subes el CPC en ambas** y matas tu propio precio promedio.

## Inputs

```ts
{
  clientId: string;
  windowDays?: number;     // default 30
  minOverlapSpend?: number; // default 500 ARS — ruido floor
}
```

## Algorithm

1. Resolver `OpsContext`.
2. Correr Q1 (search terms con campaign + ad group dimensions).
3. Agrupar por `search_term`, contar campañas distintas que lo trigerearon.
4. Filtrar términos con `count(campaigns) >= 2 AND total_spend >= minOverlapSpend`.
5. Para cada conflicto:
   - Calcular spend share por campaña sobre ese término.
   - Calcular conversion share por campaña.
   - Identificar "winner": campaña con mejor `conversions / spend` ratio.
   - Recomendar: agregar como negative en las otras campañas, o restructurar match types.
6. Score "canibalismo": `sum(spend losing campaigns) - margin where loser also converted`.

## GAQL Queries

```sql
-- Q1. Search terms con dimensión campaign + ad group
SELECT
  search_term_view.search_term,
  campaign.id, campaign.name,
  ad_group.id, ad_group.name,
  metrics.cost_micros,
  metrics.conversions,
  metrics.impressions,
  metrics.clicks
FROM search_term_view
WHERE segments.date DURING LAST_30_DAYS
  AND search_term_view.status != 'EXCLUDED'
  AND campaign.status = 'ENABLED'
ORDER BY metrics.cost_micros DESC
LIMIT 1000
```

## Output schema

```ts
{
  context: OpsContext;
  totalTermsAnalyzed: number;
  conflicts: Array<{
    searchTerm: string;
    totalSpend: number;
    totalConversions: number;
    campaigns: Array<{
      campaignId: string;
      campaignName: string;
      adGroupId: string;
      adGroupName: string;
      spend: number;
      conversions: number;
      spendShare: number;
      conversionShare: number;
      isWinner: boolean;
    }>;
    winnerCampaignId: string;
    cannibalismScore: number;
    recommendation: {
      type: 'ADD_NEGATIVE' | 'REVIEW_MATCH_TYPES' | 'CONSOLIDATE';
      details: string;
    };
  }>;
  totalCannibalismSpend: number;   // suma de spend en conflictos
}
```

## Auto-exec rules

N/A — no muta. Los negatives sugeridos hay que correlos con `gads-search-terms` o aplicarlos manualmente, porque acá la decisión es estructural (qué campaña debe ganar).

## Examples

```bash
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=elepants --skill=gads-cannibalization
```

> **Canibalización Elepants (últimos 30d)**
>
> 14 search terms con conflicto, total $32k ARS canibalizado.
>
> Top conflicts:
>
> 1. "elepants" (marca propia) | $8.4k entre **Search Marca** (winner, 87 conv) y **Performance Max** (3 conv).
>    → Agregar como negative EXACT en Performance Max.
> 2. "remera oversized hombre" | $5.1k entre **Search Categoría** (winner) y **DSA Catalogo**.
>    → Excluir esa landing del DSA o consolidar.
> 3. "buzos elepants" | $3.2k entre **Search Marca** y **Search Genéricas**.
>    → Negative en Genéricas.
