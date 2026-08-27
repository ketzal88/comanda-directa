---
name: gads-search-terms
description: Mina search terms últimos N días, sugiere negatives y auto-aplica los obvios.
metadata:
  channel: google_ads
  mutates: true
  autoExec: true
  brainContextRequired: true
---

# gads-search-terms

## Goal

Identificar **search terms** (queries reales) que están gastando plata sin convertir y proponer/aplicar negative keywords. Es la skill más ROI-positiva del set — los negatives bien aplicados liberan budget en cuestión de horas.

## Inputs

```ts
{
  clientId: string;
  windowDays?: number;        // default 30
  minImpressions?: number;    // default 100 — para evitar long-tail ruido
  matchType?: 'EXACT' | 'PHRASE' | 'BROAD';  // default 'EXACT'
}
```

## Algorithm

1. Resolver `OpsContext`: `customerId`, `targetCpa`, `currency`.
2. Si `targetCpa` no existe en `engine_configs` → fallback a config del cliente o pedir input. Sin target no podés evaluar "wasted".
3. Correr Q1 (search terms últimos windowDays).
4. Filtrar candidatos a negative:
   - `conversions == 0`
   - `cost > 2 * targetCpa` (auto-exec threshold)
   - `impressions >= minImpressions`
5. Para cada candidato, identificar la campaña y ad group origen.
6. Aplicar regla `mutation-rules.shouldAutoExec`:
   - Auto-exec si pasa todos los thresholds + window = 30 días.
   - Sino, va a `proposedActions`.
7. Para cada acción auto-exec:
   - `GoogleAdsService.addNegativeKeyword({ customerId, campaignId, keyword, matchType })`
   - Loggear en `google_ads_actions` con `mode: 'auto'`, `rollbackData: { resourceName }`.
8. Devolver `SkillResult` con `executedActions` + `needsConfirmation`.

## GAQL Queries

```sql
-- Q1. Search terms últimos N días
SELECT
  search_term_view.search_term,
  search_term_view.status,
  segments.search_term_match_type,
  campaign.id, campaign.name,
  ad_group.id, ad_group.name,
  metrics.cost_micros,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.conversions_value,
  metrics.all_conversions
FROM search_term_view
WHERE segments.date DURING LAST_30_DAYS
  AND search_term_view.status != 'EXCLUDED'
  AND campaign.status = 'ENABLED'
ORDER BY metrics.cost_micros DESC
LIMIT 500
```

**Nota**: usamos `metrics.conversions` (no `all_conversions`) porque negatives deben basarse en conversiones primarias atribuibles a esa keyword. Para reportes UI usamos `all_conversions` (per `feedback_sync_parity`), pero para decidir mutaciones acá pedimos rigor: si la KW no genera conversiones primarias, está mal targetiada.

## Output schema

```ts
{
  context: OpsContext;
  totalSearchTermsAnalyzed: number;
  candidates: Array<{
    searchTerm: string;
    matchType: string;
    campaignId: string;
    campaignName: string;
    adGroupId: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    cpa: number | null;
    autoExecEligible: boolean;
    reason: string;
  }>;
  executedActions: ExecutedAction[];   // mode=auto
  needsConfirmation: ProposedAction[]; // mode=execute pendientes confirm
  skipped: Array<{ searchTerm: string; reason: string }>;
}
```

## Auto-exec rules

Una acción `ADD_NEGATIVE` se auto-ejecuta solo si TODAS estas son verdaderas:

| Condición | Por qué |
|---|---|
| `conversions == 0` | Sin conversión primaria no aporta |
| `cost > 2 * targetCpa` | Spend mínimo significativo en ARS |
| `impressions >= 100` | Evita long-tail con muestra chica |
| `windowDays = 30` | Necesitamos ventana suficiente |

Si alguna falla → va a `needsConfirmation` para que el operador revise.

`matchType` default `EXACT` para minimizar riesgo de over-block.

## Examples

```bash
# Analyze sin mutar
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=elepants --skill=gads-search-terms --mode=analyze

# Execute — aplica auto-exec, deja resto en pending
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=elepants --skill=gads-search-terms --mode=execute

# Dry-run — simula y loggea sin tocar GAds
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=elepants --skill=gads-search-terms --mode=dry_run
```
