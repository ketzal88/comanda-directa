---
name: paid-media-specialist
emoji: 💰
color: orange
category: team-role
vibe: "Opera campañas como un piloto de F1 — ajuste constante, datos en tiempo real"
brain-usage: heavy
success-metrics: "ROAS on target, CPA within 2σ, Frequency <3 (7d), Creative diversity >5 concepts"
description: "Paid Media Specialist operational knowledge — Meta Ads and Google Ads campaign management, GEM/Andromeda frameworks, creative diagnostics, campaign structure, scaling, troubleshooting, and Worker Brain integration. Use when advising on paid media operations, diagnosing campaign issues, creating briefs, or optimizing Meta/Google Ads performance."
---

# Paid Media Specialist — Operational Brain

## Role
Operates and optimizes Meta Ads and Google Ads campaigns for e-commerce clients. Executes the strategy defined by the Manager. Reports to the TL de Paid Media.

## Worker Brain Integration (MANDATORY)

### Before Any Analysis
1. Open Worker Brain (brain.worker.ar) → select client
2. Check dashboard for current KPIs (ROAS, CPA, CTR, frequency)
3. Check active alerts (39 types across all channels)
4. Use AI Analyst (Meta Ads or Google Ads channel) for conversational diagnosis

### Key Brain Pages
- **Ads Manager** (`/ads-manager`): Campaign and creative management
- **Decision Board** (`/decision-board`): Automated scale/pause/rotate recommendations
- **Creative Intel** (`/creative`): Creative performance + DNA + classification
- **Google Ads** (`/google-ads`): Campaigns + search terms + video funnel

### Brain Alerts Relevant to Paid Media
**Meta (16 alerts):** SCALING_OPPORTUNITY, CPA_SPIKE, BUDGET_BLEED, ROTATE_CONCEPT, LEARNING_RESET_RISK, CPA_VOLATILITY, CONSOLIDATE, KILL_RETRY, HOOK_KILL, BODY_WEAK, CTA_WEAK, VIDEO_DROPOFF, IMAGE_INVISIBLE, IMAGE_NO_CONVERT, CREATIVE_MIX_IMBALANCE, INTRODUCE_BOFU_VARIANTS
**Google (6 alerts):** GOOGLE_CPA_SPIKE, GOOGLE_BUDGET_BLEED, + 4 more
**Cross-Channel (3):** ATTRIBUTION_GAP, SPEND_IMBALANCE, CHANNEL_CANNIBALIZATION

### Daily Workflow with Brain
```
MONDAY (5 min Brain + 10 min Claude):
  1. Read Morning Briefing in Slack
  2. Open Brain → check flagged accounts
  3. AI Analyst for deeper diagnosis if needed
  4. Claude for weekly report to manager

WEDNESDAY (5 min):
  1. Check Brain alerts + frequency trends
  2. Review Creative Intel for creative fatigue

FRIDAY (5 min):
  1. Quick Brain check: KPIs on track for monthly goal?
  2. If anomaly → AI Analyst diagnosis
```

## GEM Framework (Meta Ads)
Meta's ad delivery: **G**enerate candidates → **E**stimate value per impression → **M**aximize total value.
- **G (Generation)**: Structure and creative diversity determine the candidate pool
- **E (Estimation)**: Signal quality (Pixel + CAPI + EMQ) determines prediction accuracy
- **M (Maximization)**: Algorithm optimizes for the objective — if wrong objective, wrong optimization

### Andromeda (Creative Ranking)
Meta's creative ranking system scores each ad per impression. Key inputs:
- **Signal quality**: EMQ >7 is critical. Below 5 = algorithm is guessing
- **Creative diversity**: More distinct creatives = more candidates = better optimization
- **Frequency control**: High frequency = audience saturation = declining marginal value

## Diagnostic Decision Tree

### ROAS Dropped
```
1. Is Pixel/CAPI still firing? → If NO: fix tracking first
2. Did frequency spike (>4 in 7d)? → If YES: creative fatigue, rotate
3. Did CTR drop? → If YES: creative problem (hook/visual)
4. CTR stable but CVR dropped? → If YES: site/landing problem
5. CPM spiked? → If YES: auction competition (check if seasonal)
6. Recent campaign changes? → If YES: learning phase disruption
```

### When to Scale
- ROAS consistently above target for 7+ days
- CPA stable or declining
- Frequency below 3 in 7 days
- Brain shows SCALING_OPPORTUNITY alert
- Scale +20-30%, wait 3-5 days before next increase

### When to Pause/Rotate
- Brain shows ROTATE_CONCEPT or HOOK_KILL alert
- Frequency >4 in 7 days + CPA rising
- Creative classified as "Zombie" or "Inefficient TOFU" in Brain
- Hook Rate <20% with >$50 spend

## Campaign Structure Best Practices

### Meta Ads
```
ACQUISITION (Broad):
  - CBO campaign, Sales objective
  - 1-3 ad sets with broad targeting (age + gender only)
  - 3-5 diverse creatives per ad set
  - Let Andromeda find the audience

RETARGETING:
  - Separate campaign
  - Website visitors 30d (exclude purchasers)
  - DPA (Dynamic Product Ads) if catalog connected
  - Lower budget (15-20% of total)

RETENTION:
  - Existing customers 180d
  - New products, upsell, cross-sell
  - Lowest budget (5-10% of total)
```

### Google Ads
```
SEARCH BRAND: Always active, highest priority
SHOPPING/pMax: Main acquisition engine
SEARCH NON-BRAND: Selective, high-intent keywords only
```

## KPI Benchmarks
| KPI | 🔴 | 🟡 | 🟢 |
|-----|----|----|-----|
| ROAS (40% margin) | <2x | 2-3x | >3x |
| CTR (link) | <0.5% | 0.5-1% | >1.5% |
| Hook Rate | <20% | 20-30% | >30% |
| Hold Rate | <10% | 10-20% | >20% |
| Frequency (7d) | >5 | 3-4 | 1-2 |
| EMQ | <5 | 6-7 | >8 |

## Metric Conjunction Diagnostics
- **ROAS low + CTR low + Hook low** → Creative doesn't stop scroll
- **ROAS low + CTR high + CVR low** → Site problem, not ads
- **ROAS low + CTR high + EMQ low** → Signal problem, fix CAPI
- **ROAS dropping + Frequency high** → Creative fatigue
- **Hook >30% + Hold <10%** → Hook works, middle section fails
- **CPM high + CTR low** → Double problem: expensive audience + weak creative
- **pMax ROAS very high + Search Non-brand ROAS low** → pMax stealing brand queries
