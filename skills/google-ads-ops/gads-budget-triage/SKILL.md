---
name: gads-budget-triage
description: Identifica campañas above target CPA con drivers y fixes priorizados. Puede sugerir cambio de budget (nunca auto).
metadata:
  channel: google_ads
  mutates: true
  autoExec: false
  brainContextRequired: true
---

# gads-budget-triage

## Goal

Dado un `targetCpa` (del `engine_configs` del cliente), listar todas las campañas activas que están **above target**, identificar drivers probables y proponer ajustes de budget. **Nunca** auto-aplica cambios de budget — siempre pide confirmación.

## Inputs

```ts
{
  clientId: string;
  windowDays?: number;        // default 14
  customTargetCpa?: number;   // override del engine_config si quieres
}
```

## Algorithm

1. Resolver `OpsContext`. Si `targetCpa` no existe → fallar con `MISSING_TARGET_CPA`.
2. Correr Q1 (campaign metrics + budget) últimos windowDays.
3. Por campaña: calcular `cpa = cost_micros / conversions / 1_000_000`.
4. Filtrar `cpa > targetCpa AND conversions > 0` (con conversiones para evaluar).
5. Para cada above-target, sub-query:
   - Q2: device split → CPA por device
   - Q3: top 5 keywords por cost
   - Q4: impression share signals
6. Detectar driver principal:
   - Si `search_budget_lost_impression_share > 0.30` → driver: **BUDGET_CAPPED** (subir budget si CPA aún razonable, sino reducir)
   - Si `search_rank_lost_impression_share > 0.30` → driver: **AD_RANK** (mejorar QS o bid)
   - Si CPA mobile >> CPA desktop → driver: **MOBILE_LP_ISSUE**
   - Si top kw está canibalizando entre campañas → driver: **STRUCTURE** (sugerir gads-cannibalization)
7. Sugerir acción concreta con magnitud (ej "Subir budget de $X a $Y porque pierde 47% por budget pero CPA aún en target en horas pico").

## GAQL Queries

```sql
-- Q1. Campaign performance + budget
SELECT
  campaign.id, campaign.name,
  campaign.bidding_strategy_type,
  campaign_budget.amount_micros,
  campaign_budget.resource_name,
  metrics.cost_micros, metrics.conversions, metrics.conversions_value,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share,
  metrics.average_cpc,
  metrics.average_target_cpa_micros
FROM campaign
WHERE campaign.status = 'ENABLED'
  AND segments.date DURING LAST_14_DAYS
```

```sql
-- Q2. Device breakdown per campaign
SELECT
  campaign.id, segments.device,
  metrics.cost_micros, metrics.conversions
FROM campaign
WHERE campaign.status = 'ENABLED'
  AND segments.date DURING LAST_14_DAYS
```

## Output schema

```ts
{
  context: OpsContext;
  targetCpa: number;
  currency: string;
  totalCampaigns: number;
  aboveTarget: Array<{
    campaignId: string;
    campaignName: string;
    spend: number;
    conversions: number;
    cpa: number;
    cpaOverTargetPct: number;          // (cpa - targetCpa) / targetCpa
    biddingStrategy: string;
    dailyBudget: number;
    impressionShare: number;
    lostByBudget: number;
    lostByRank: number;
    primaryDriver: 'BUDGET_CAPPED' | 'AD_RANK' | 'MOBILE_LP_ISSUE' | 'STRUCTURE' | 'UNKNOWN';
    suggestedAction: {
      type: 'UPDATE_BUDGET' | 'PAUSE_CAMPAIGN' | 'IMPROVE_QS' | 'INVESTIGATE_STRUCTURE';
      payload?: {
        currentDailyBudget?: number;
        suggestedDailyBudget?: number;
        reason: string;
      };
    };
  }>;
  proposedActions: ProposedAction[];   // always needs confirmation
}
```

## Auto-exec rules

**Nunca auto-exec.** Todos los cambios de budget van a `needsConfirmation`. El operador revisa y confirma con:

```bash
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --confirm=<actionId>
```

## Examples

```bash
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=elepants --skill=gads-budget-triage
```

> **Triage budget Elepants (target $1,200 ARS)**
>
> 3 campañas above target:
>
> 1. **Performance Max - Productos** | CPA $1,850 (+54%) | spend $94k/sem | driver: AD_RANK (pierde 38% por rank)
>    → Sugerencia: revisar audience signal y QS de feed, NO subir budget.
> 2. **Search - Marca + Genéricas** | CPA $1,560 (+30%) | spend $42k/sem | driver: BUDGET_CAPPED (pierde 47% por budget)
>    → Sugerencia: subir daily de $6k a $8k (la campaña convierte cuando tiene aire).
> 3. **DSA Catalogo** | CPA $2,100 (+75%) | spend $18k/sem | driver: STRUCTURE
>    → Sugerencia: correr `gads-cannibalization` para ver si compite con Search marca.
