---
name: onboarding-sop
emoji: 🚀
color: blue
category: operations
vibe: "De reunión de discovery a kick-off en 10 días — sin saltear nada"
brain-usage: medium
success-metrics: "Onboarding <10 days, Audit 100% complete, Brain setup day 1, Month 1 plan delivered"
description: "Client onboarding SOP — complete 6-phase process from discovery meeting to kick-off. Covers technical audits (Meta, Google, Email, SEO, Site), KPI benchmarks, ROAS calculations, cross-channel diagnostics, and Worker Brain setup for new clients. Use when onboarding new e-commerce clients, running audits, defining objectives, or planning the first month of work."
---

# Onboarding de Cliente Nuevo — SOP Operativo

## Process Overview (5-10 business days)

### Phase 1: Discovery Meeting
15 essential questions across 4 areas:
- **Business**: Ticket promedio, margen bruto, top 3 products, restrictions, seasonality
- **Customer**: Last 12m buyers, repeat rate, email list size
- **Marketing**: Active channels, monthly spend, current ROAS, previous agencies
- **Resources**: Who makes creatives? Who decides pricing/stock?

**Red flags**: Client doesn't know margin (can't set ROAS target), undisclosed Meta restrictions, expects scaling month 1, no designer/budget for creatives.

### Phase 2: Technical Audit
Audit ALL channels before spending any budget.

**Meta Ads**: Pixel active + CAPI + EMQ >7 + catalog connected + campaign structure + 90-day performance
**Google Ads**: Merchant Center feed health + conversion tag + campaign structure + 90-day performance
**Email**: SPF/DKIM/DMARC + store integration + flows (welcome, cart, post-purchase) + list health
**SEO**: Search Console + sitemap + Core Web Vitals + indexation + quick wins (position 5-20)
**Site**: Speed (<3s mobile) + checkout test + payment options + social proof + GA4 events

> **Worker Brain**: All KPI benchmarks from the audit are monitored automatically once the client is set up in Brain. After the audit, register the client — Brain auto-backfills historical data from Jan of previous year.

### Phase 3: Define Benchmarks
Most critical number: **ROAS mínimo rentable** = 1 ÷ margen bruto

| Margin | Break-even ROAS | Target ROAS |
|--------|----------------|-------------|
| 60% | 1.67x | >2.5x |
| 50% | 2x | >3x |
| 40% | 2.5x | >3.5x |
| 30% | 3.3x | >4.5x |
| 20% | 5x | >7x |

### Phase 4: Technical Setup
- Meta: Verify Pixel + CAPI + EMQ + catalog + audiences (custom + lookalike)
- Google: Verify conversion tag + GA4 link + Merchant Center feed
- Email: Verify domain auth + store integration + activate 3 essential flows
- Analytics: Verify GA4 ecommerce events + remarketing audiences

> **Worker Brain setup**: Register client in Brain with Meta account ID, Google customer ID, ecommerce store credentials, email platform API key. Brain auto-backfills from Jan of previous year. From day 1: Morning Briefing in Slack, 39 alerts active, AI Analyst available.

### Phase 5: Plan First Month
Month 1 is NOT for scaling — it's for learning. Goals: fix infrastructure, establish real KPI baselines, find 2-3 high-impact opportunities for month 2.

| Area | Month 1 Focus |
|------|--------------|
| Meta | Tech setup + 1 broad acquisition + basic retargeting |
| Google | Fix feed + pMax with basic signals + Search Brand |
| Email | Activate 3 essential flows (welcome, cart, post-purchase) |
| SEO | Tech audit + indexation fixes + 3-5 Search Console quick wins |

> **Brain from day 1**: Morning Briefing daily, alerts detecting issues, AI Analyst for questions, dashboard with all KPIs.

### Phase 6: Kick-off Meeting (60 min)
- 0-10 min: Audit summary (traffic light per channel)
- 10-25 min: Define objectives (ROAS mínimo rentable calculated live)
- 25-40 min: Month 1 plan
- 40-55 min: Expectations and communication cadence
- 55-60 min: Next steps with responsible + dates

## KPI Benchmarks Quick Reference

### Meta Ads
| KPI | 🔴 | 🟡 | 🟢 |
|-----|----|----|-----|
| ROAS (40% margin) | <2x | 2-3x | >3x |
| CPA | >margin | near margin | <50% margin |
| CTR (link) | <0.5% | 0.5-1% | >1.5% |
| Hook Rate | <20% | 20-30% | >30% |
| Hold Rate | <10% | 10-20% | >20% |
| Frequency (7d) | >5 | 3-4 | 1-2 |
| EMQ | <5 | 6-7 | >8 |
| CPM | >$15 | $8-15 | <$8 |

### Google Ads
| KPI | 🔴 | 🟡 | 🟢 |
|-----|----|----|-----|
| ROAS pMax | <2x | 2-4x | >5x |
| ROAS Search Brand | <5x | 5-10x | >10x |
| CTR Shopping | <0.8% | 0.8-1.5% | >1.5% |
| CTR Search | <3% | 3-6% | >6% |
| Impression Share (brand) | <50% | 50-80% | >80% |
| Quality Score | <5 | 5-7 | >7 |
| Products approved | <70% | 70-90% | >90% |

### Email
| KPI | 🔴 | 🟡 | 🟢 |
|-----|----|----|-----|
| Open Rate | <15% | 15-25% | >30% |
| Click Rate | <1% | 1-2% | >3% |
| Spam Rate | >0.08% | 0.04-0.08% | <0.04% |
| Cart Recovery | <3% | 3-8% | >10% |
| Active list % | <30% | 30-50% | >50% |

### Site
| KPI | 🔴 | 🟡 | 🟢 |
|-----|----|----|-----|
| CVR | <0.5% | 0.5-1.5% | >2% |
| Cart Abandonment | >85% | 70-85% | <65% |
| Bounce Rate | >70% | 50-70% | <50% |
| Mobile LCP | >4s | 2.5-4s | <2.5s |

## Cross-Channel Diagnostic Patterns
- **Meta ROAS good + Google ROAS good + Revenue low** → Attribution overlap
- **Email OR good + Meta CTR low** → Brand works warm, not cold
- **All channels OK + CVR low** → Site is the bottleneck
- **Meta good + Email bad** → Acquires but doesn't retain
- **SEO good + Email good + Ads bad** → Low-cost channels work, ads need creative/margin review
- **High traffic + low CVR** → Fix site before scaling any channel
