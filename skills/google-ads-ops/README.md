# Google Ads Operator Suite

Skills operativas para diagnosticar y mutar cuentas de Google Ads de clientes del Brain.

**Spec:** [docs/superpowers/specs/2026-06-02-google-ads-operator-suite-design.md](../../../docs/superpowers/specs/2026-06-02-google-ads-operator-suite-design.md)

## Skills (8 custom, en español)

| Slug | Qué hace | Muta | Auto-exec |
|---|---|---|---|
| [`gads-audit-account`](./gads-audit-account/SKILL.md) | Auditoría completa: estructura, QS, conversion tracking, top fixes | ❌ | — |
| [`gads-search-terms`](./gads-search-terms/SKILL.md) | Mina search terms últimos N días, sugiere/aplica negatives | ✅ ADD_NEGATIVE | Condicional |
| [`gads-anomaly-cpa`](./gads-anomaly-cpa/SKILL.md) | CPA spike diagnosis vs semana anterior | ❌ | — |
| [`gads-budget-triage`](./gads-budget-triage/SKILL.md) | Campañas above target CPA del engine_config | ✅ UPDATE_BUDGET | Nunca auto |
| [`gads-quality-score`](./gads-quality-score/SKILL.md) | QS distribution + keywords prioritarios | ❌ | — |
| [`gads-cannibalization`](./gads-cannibalization/SKILL.md) | Cross-campaign keyword overlap | ❌ | — |
| [`gads-wasted-spend`](./gads-wasted-spend/SKILL.md) | KW con $$ y 0 conv en 30d | ✅ ADD_NEGATIVE | Condicional |
| [`gads-creative-rotation`](./gads-creative-rotation/SKILL.md) | RSAs underperformers | ✅ PAUSE_AD | Nunca auto |

## Cómo se invocan

**CLI (Claude Code en este repo):**

```bash
npx tsx --require ./scripts/load-env.cjs scripts/google-ads-ops/run.ts \
  --client=<slug> --skill=<slug> [--mode=analyze|execute|dry_run]
```

**Brain UI** (F2): panel "Acciones AI" en `/google-ads/[clientId]`.

**AI Analyst** (F3): tools en el chat de `/google-ads`.

## Reglas de auto-exec

Solo `ADD_NEGATIVE` puede auto-ejecutarse, y solo cuando se cumplen condiciones estrictas:

- `gads-search-terms`: `conversions = 0 AND cost > 2 * targetCpa AND impressions >= 100` (últimos 30d)
- `gads-wasted-spend`: `conversions = 0 AND cost > 3 * targetCpa` (última semana)

**Cualquier otra mutación** (PAUSE_AD, UPDATE_BUDGET) → siempre requiere confirmación humana.

## Fallback: 21 skills de Elias

Para casos no cubiertos por nuestros 8 (audiences/RLSA, scripts, ad-extensions, attribution, etc.) usar la suite upstream en [`../google-ads-skills/`](../google-ads-skills/) — pinneada read-only.

## Context auto-resuelto

Toda skill recibe `clientId` y la capa de ejecución resuelve:

- `customerId` ← `clients.{clientId}.googleAdsId` (sin guiones)
- `loginCustomerId` ← `GOOGLE_ADS_LOGIN_CUSTOMER_ID` env (MCC de Worker)
- `currency` ← `clients.{clientId}.currency` (default `ARS`)
- `targetCpa` ← `engine_configs` doc del cliente
- `defaultObjective` ← `clients.{clientId}.defaultObjective`

## Audit log

Toda mutación se escribe a `google_ads_actions` con `rollbackData` para reversa.
