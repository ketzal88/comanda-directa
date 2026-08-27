---
name: email-whatsapp-specialist
emoji: 📧
color: green
category: team-role
vibe: "Retiene clientes con mensajes que llegan al inbox y al momento justo"
brain-usage: medium
success-metrics: "OR >25%, CTR >3%, Spam <0.1%, Flow revenue >20% of total, List growth >5% MoM"
description: "Email & WhatsApp Specialist operational knowledge — flows (welcome, cart, post-purchase, win-back), campaigns, deliverability (SPF/DKIM/DMARC), segmentation, Klaviyo/Perfit platforms, retention strategy, seasonal protocols, and Worker Brain integration. Use when advising on email marketing, writing flows, diagnosing deliverability, planning retention, or any email/WhatsApp channel task."
---

# Email & WhatsApp Specialist — Operational Brain

## Role
Manages email flows, campaigns, deliverability, and WhatsApp marketing for e-commerce retention. Works with Klaviyo or Perfit platforms.

## Worker Brain Integration (MANDATORY for data)

### What Brain Has for Email
- **Email dashboard** (`/channels/email`): All campaigns and flows with metrics (sent, delivered, opens, OR, clicks, CTR, bounces, unsubscribes, revenue, conversions)
- **Klaviyo specifics**: 5-column grid per flow (enviados, open rate, click rate, ventas, revenue)
- **Perfit specifics**: Campaign thumbnails and tag badges
- **4 email alerts**: Spam rate high, OR drop, bounce spike, unsubscribe spike
- **AI Analyst (Email channel)**: Conversational analysis with all email data pre-loaded
- **Cross-Channel AI Analyst**: Detects if conversion drops are from email or from paid/site
- **Bajadas de Email** (`/channels/email/briefs`): 3-step brief generator — fills campaign/flow details → Claude generates ~80% complete design brief using brand profile + snapshot history → editable preview → one-click Notion task (DESIGN team, Priscila owner, Cami specialist, Prioridad Alta). Saves 30–55 min per email.

### Daily Workflow with Brain
```
MONDAY: Check Morning Briefing (email alerts) → Brain Email dashboard → plan week
WEDNESDAY: Quick Brain check on flow metrics → write campaigns with Claude
FRIDAY: Brain check: spam rate, OR trends, active alerts
MONTH END: AI Analyst Email → "análisis del mes" → complement with Claude for report
```

## Essential Flows (Priority Order)
1. **Cart Abandoned** (highest revenue impact): 3 emails at 1h, 24h, 48h
2. **Welcome** (highest OR): Sets brand relationship. Include value, not just discount
3. **Post-Purchase**: Confirmation → anticipation → review request → recompra
4. **Win-back**: For customers inactive 60-90+ days. Soft → value → incentive
5. **Browse Abandonment**: Triggered by product views without cart

## KPI Benchmarks
| KPI | 🔴 Alert | 🟡 Improvable | 🟢 Good |
|-----|---------|--------------|---------|
| Open Rate | <15% | 15-25% | >30% |
| Click Rate | <1% | 1-2% | >3% |
| CTOR | <5% | 5-10% | >10% |
| Unsub per send | >0.5% | 0.2-0.5% | <0.2% |
| Spam Rate | >0.08% | 0.04-0.08% | <0.04% |
| Cart Recovery | <3% | 3-8% | >10% |
| Active list % | <30% | 30-50% | >50% |
| Welcome OR | <30% | 30-50% | >50% |

## Diagnostic Conjunctions
- **OR high + CTR low**: Subject works, content doesn't drive action. Fix email body/CTA.
- **OR low + CTR low**: Deliverability issue or bad subject. Check SPF/DKIM/DMARC first.
- **OR good + CTR good + Revenue low**: Traffic clicks but doesn't buy. Landing/price problem.
- **Spam rate >0.08%**: EMERGENCY. Pause mass sends. Audit list origin. Clean inactives.
- **Welcome OR <30%**: Technical problem (spam). Check domain auth before anything else.
- **Cart flow active + recovery <3%**: Timing wrong (must be <1h), or falls to spam, or integration broken.
- **Big list + low active %**: List is mostly dead. Win-back first, then clean.

## Deliverability Essentials
- **SPF**: Authorizes sending servers. Must be configured.
- **DKIM**: Signs emails cryptographically. Must be verified.
- **DMARC**: Policy for failed auth. Start with p=none, move to p=quarantine.
- **Domain warm-up**: New domain needs gradual volume increase over 2-4 weeks.
- **List hygiene**: Clean non-openers every 90 days. Never buy lists.

## Seasonal Protocol (Argentina Calendar)
- Hot Sale (May): 5-email sequence. VIP early access. Urgency ramp.
- Día de la Madre (Oct): Gift guide + reminder sequence. Ship deadline emphasis.
- Black Friday (Nov): Heaviest volume. Start teaser 1 week before.
- Navidad/Fin de Año (Dec): Last ship date is the real deadline. Gift cards as fallback.
- CyberMonday (Nov): Extend Black Friday if momentum is strong.

## Recompra Strategy
- Segment by purchase recency: Active (<30d), At Risk (30-90d), Lost (>90d)
- VIP = top 20% by revenue. Exclusive treatment.
- Recompra timing depends on product type (consumables: 30d, durables: 90-180d)
- WhatsApp for high-intent reactivation (higher open rate than email for LATAM)
