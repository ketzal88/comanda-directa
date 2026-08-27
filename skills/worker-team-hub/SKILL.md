---
name: worker-team-hub
emoji: 🏢
color: gray
category: operations
vibe: "El cerebro operativo que conecta todos los roles con Worker Brain como eje central"
brain-usage: reference
success-metrics: "Team alignment 100%, Brain adoption across all roles, Cross-role workflows documented"
description: "Master operational hub for all Worker Digital team roles. Covers how every role (Marketing Manager, Paid Media Specialist, Email Specialist, Designer, Community Manager, Team Leaders, Account Manager) uses the Worker Brain platform as their central intelligence tool. Use when coordinating across roles, understanding team workflows, onboarding team members, or any task requiring cross-role knowledge of the Worker team operations and Brain integration."
---

# Worker Team Hub — Cerebro Operativo del Equipo

This skill is the **master reference** for how the entire Worker Digital team operates, how each role connects with the others, and how Worker Brain is the central intelligence platform that ties everything together.

## The Golden Rule

**Worker Brain (brain.worker.ar) is MANDATORY and goes FIRST for any task involving client data.** Claude, Gemini, and other AI tools complement — they don't replace the Brain.

## Team Structure & Roles

| Role | Primary Focus | Brain Usage Level |
|------|--------------|-------------------|
| **E-Commerce Marketing Manager** | Strategy, planning, reporting, client communication | Heavy — Cross-Channel AI Analyst, Monthly Reports, all dashboards |
| **Paid Media Specialist** | Meta Ads + Google Ads campaign operation | Heavy — Meta/Google dashboards, Creative Intel, Decision Board, alerts |
| **Email & WhatsApp Specialist** | Flows, campaigns, deliverability, retention | Medium — Email dashboard, flow metrics, email alerts |
| **Diseñador** | Creative production (video, image, carousel) | Medium — Creative Intel (performance data), Creative DNA (patterns) |
| **Community Manager** | Organic content, community, RRSS | Light — Creative Intel (for content inspiration), top products |
| **TL de Paid Media** | Supervise traffickers, portfolio oversight | Heavy — Command Center, all client dashboards, alerts, Weekly Review |
| **TL de Diseño** | Supervise designers, creative quality standards | Medium — Creative Intel, Creative DNA, Diversity Score, Decision Board |
| **Marketing Manager Leads** | Lead gen clients (not e-commerce) | Medium — Leads dashboard, funnel metrics, lead alerts |
| **Account Manager** | Client retention, upselling, QBRs, commercial proposals | Heavy — Command Center, Cross-Channel AI Analyst, Customer Intel, Competitor Intel |

## Worker Brain — What Every Role Should Know

### Core Pages
| Page | URL | Who Uses It |
|------|-----|------------|
| Command Center | `/dashboard` | Managers, TLs |
| Ads Manager | `/ads-manager` | Paid Media, TL Paid |
| Decision Board | `/decision-board` | Paid Media, TL Paid, TL Diseño |
| Creative Intel | `/creative` | Paid Media, Diseñador, TL Diseño, CM |
| Ecommerce | `/ecommerce` | Manager, Email Specialist |
| Email Marketing | `/email` | Email Specialist, Manager |
| Google Ads | `/google-ads` | Paid Media, Manager |
| Leads | `/channels/leads` | Marketing Manager Leads |
| Cerebro de Worker | `/admin/cerebro` | Manager (AI config) |

### AI Analyst Channels
The AI Analyst is a conversational chat panel powered by Claude with client data pre-loaded. Available channels:
- **Meta Ads** → campaigns, creatives, fatigue, scaling decisions
- **Google Ads** → campaigns, search terms, video funnel, shopping
- **Ecommerce** → sales, products, attribution, customers, LTV
- **Email** → campaigns, flows, deliverability, segmentation
- **Cross-Channel** → cross-signal analysis, attribution gaps, spend distribution
- **Competitors** → prices, stock, policies
- **Leads** → funnel, qualification, conversion rates

**How to open:** Click "Analizar con IA" button in any channel section.

### 39 Automatic Alerts (by channel)
| Channel | # Alerts | Key Alerts |
|---------|---------|------------|
| Meta Ads | 16 | CPA Spike, Budget Bleed, Scaling Opportunity, Rotate Concept, Hook Kill, Body Weak, CTA Weak, Image Invisible, Creative Mix Imbalance |
| Google Ads | 6 | CPA Spike, Budget Bleed, Impression Share Drop, Quality Score Drop |
| Ecommerce | 6 | CVR Drop, AOV Drop, Revenue Drop, Cart Abandonment Spike |
| Email | 4 | Spam Rate High, OR Drop, Bounce Spike, Unsubscribe Spike |
| Leads | 4 | CPL Spike, Qualification Rate Drop, Response Time Slow |
| Cross-Channel | 3 | Attribution Gap, Spend Imbalance, Channel Cannibalization |

### Automated Slack Digests
| Digest | Schedule | Content |
|--------|----------|---------|
| Morning Briefing | Daily 10:15 UTC | Performance summary + alerts + action items (max 3) |
| Weekly Review | Monday 10:30 UTC | WoW comparison + canal-by-canal detail + focus recommendations |
| Monthly Report | Day 2, 10:00 UTC | MoM comparison + top performers + health scores |

### Creative Intelligence
- **Creative DNA**: AI analysis of each creative — visual style, hook type, dominant color, has text/face/product, emotional tone, message type, CTA type
- **6-Category Classification**: Dominant Scalable, Winner Saturating, Hidden BOFU, Inefficient TOFU, Zombie, New Insufficient Data
- **Diversity Score**: unique entity groups / total active ads per client
- **Decision Board**: Automated recommendations (scale, pause, rotate) per creative

### Customer Intelligence (Ecommerce)
- LTV per cohort (first-time, returning, VIP)
- Retention rate, days between purchases
- LTV:CAC ratio (reads ad spend from Meta + Google)

### Competitor Intelligence
- Price monitoring for tracked products
- Stock availability tracking
- Policy/shipping comparison
- Weekly cron (Sunday 20:00 UTC)

## Cross-Role Workflows

### Daily Flow
```
Morning Briefing arrives in Slack (10:15 UTC)
  → Manager reviews, identifies action items
  → TL Paid Media checks alerts for their portfolio
  → Paid Media Specialist opens Brain for flagged accounts
  → Email Specialist checks email alerts
  → Action items assigned to relevant team member
```

### Weekly Flow
```
Monday: Weekly Review arrives in Slack
  → Manager presents to team
  → TL distributes focus areas
  → Each specialist reviews their channel in Brain
  → Designers check Creative Intel for performance data
```

### Monthly Flow
```
Day 2: Monthly Report arrives in Slack
  → Manager prepares client reports (Brain data + Claude for writing)
  → TL Paid Media audits all accounts in Brain
  → TL Diseño reviews creative patterns in Creative DNA
  → Email Specialist analyzes flow performance
  → Manager holds planning meeting with data from Brain
```

### Creative Production Flow
```
Manager defines angles (informed by Brain Creative DNA patterns)
  → Paid Media writes brief (with Brain performance data as input)
  → TL Diseño validates brief quality
  → Designer produces (references Brain Creative Intel for what works)
  → Paid Media launches
  → Brain tracks performance → Creative DNA → Decision Board
  → Loop: data informs next creative cycle
```

### Onboarding New Client
```
Phase 1: Discovery meeting (15 questions)
Phase 2: Technical audit (Meta, Google, Email, SEO, Site)
  → Use Brain KPI benchmarks as reference for audit
Phase 3: Define benchmarks and objectives (ROAS mínimo rentable)
Phase 4: Technical setup + register client in Brain
  → Brain auto-backfills historical data from Jan previous year
Phase 5: Plan first month
  → Brain available from day 1: Morning Briefing, alerts, AI Analyst
Phase 6: Kick-off meeting with client
```

## KPI Benchmarks Quick Reference

### Meta Ads
| KPI | 🔴 Alert | 🟡 Improvable | 🟢 Good |
|-----|---------|--------------|---------|
| ROAS (40% margin) | <2x | 2-3x | >3x |
| CTR (link) | <0.5% | 0.5-1% | >1.5% |
| Hook Rate (3s video) | <20% | 20-30% | >30% |
| Hold Rate (complete) | <10% | 10-20% | >20% |
| Frequency (7d) | >5 | 3-4 | 1-2 |
| CPM | >$15 | $8-15 | <$8 |

### Google Ads
| KPI | 🔴 Alert | 🟡 Improvable | 🟢 Good |
|-----|---------|--------------|---------|
| ROAS pMax | <2x | 2-4x | >5x |
| ROAS Search Brand | <5x | 5-10x | >10x |
| CTR Shopping | <0.8% | 0.8-1.5% | >1.5% |
| Impression Share (brand) | <50% | 50-80% | >80% |

### Email
| KPI | 🔴 Alert | 🟡 Improvable | 🟢 Good |
|-----|---------|--------------|---------|
| Open Rate | <15% | 15-25% | >30% |
| Click Rate | <1% | 1-2% | >3% |
| Spam Rate | >0.08% | 0.04-0.08% | <0.04% |
| Cart Recovery | <3% | 3-8% | >10% |

### Site / Ecommerce
| KPI | 🔴 Alert | 🟡 Improvable | 🟢 Good |
|-----|---------|--------------|---------|
| CVR | <0.5% | 0.5-1.5% | >2% |
| Cart Abandonment | >85% | 70-85% | <65% |
| Bounce Rate | >70% | 50-70% | <50% |

## Metric Conjunction Diagnostics

### Meta Ads
- **ROAS low + CTR low + Hook Rate low** → Creative doesn't stop scroll. Change first 3 seconds.
- **ROAS low + CTR high + site CVR low** → Ad attracts clicks but site doesn't convert. Fix landing, not ads.
- **ROAS low + CTR high + EMQ low (<5)** → Signal problem. Fix CAPI/Pixel urgently.
- **ROAS dropping + Frequency high (>4/7d)** → Creative fatigue. Rotate creatives.
- **Hook Rate >30% + Hold Rate <10%** → Hook works but video loses after 3s. Fix middle section.

### Cross-Channel
- **Meta ROAS good + Google ROAS good + Total revenue low** → Attribution overlap. Both claiming same sales.
- **Email OR good + Meta CTR low** → Brand works for warm audience, not cold. Use email insights for ad copy.
- **All traffic good + CVR low** → Site is the bottleneck. Fix site before scaling ads.
- **Meta good + Email bad (small/inactive list)** → Acquires but doesn't retain. Set up post-purchase flows.

## Tool Decision Tree

```
STEP 1 (ALWAYS): Does this involve client data?
  → YES → Worker Brain (brain.worker.ar) FIRST
  → NO → Continue below

STEP 2: Is this text, analysis, or strategy?
  → Claude (claude.ai)

STEP 3: Is this quick design or template?
  → Canva

STEP 4: Is this high-production design?
  → Adobe CC (Photoshop, Illustrator, Premiere)

STEP 5: Is this quick video / UGC / Reels?
  → CapCut (auto-captions, auto-reframe)

STEP 6: Need AI-generated images?
  → Freepik AI / Highfield / Adobe Firefly

STEP 7: Working in Sheets with data?
  → Gemini in Sheets (=GEMINI())
```
