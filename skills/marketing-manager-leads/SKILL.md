---
name: marketing-manager-leads
emoji: 🎯
color: teal
category: team-role
vibe: "Convierte clics en leads calificados y leads en clientes — sin carrito de compras"
brain-usage: medium
success-metrics: "CPL on target, Qualification rate >30%, Lead-to-client >10%, Response time <5min"
description: "Marketing Manager for Leads, Reservations and B2B — operational knowledge for non-e-commerce clients (services, restaurants, health, B2B). Covers lead funnels, CPL optimization, WhatsApp sales pipelines, nurturing sequences, form design, VSL strategy, and Worker Brain leads channel integration. Use when working with lead-gen clients, designing funnels, optimizing CPL, or planning lead nurturing."
---

# Marketing Manager — Leads, Reservas y B2B

## How This Differs from E-Commerce
| Aspect | E-Commerce | Leads/Reservas |
|--------|-----------|---------------|
| Conversion | Purchase on site | Form fill / WhatsApp / Call |
| Metric | ROAS, Revenue | CPL, Cost per Qualified Lead, Close Rate |
| Funnel | Short (ad → site → buy) | Long (ad → landing → form → nurture → close) |
| Attribution | Direct (Pixel tracks purchase) | Indirect (CRM tracks qualification + close) |
| Value timing | Immediate | Days to months later |

## Worker Brain Integration

### Leads Channel in Brain
- **Dashboard** (`/channels/leads`): Funnel visualization, lead metrics, conversion rates
- **Lead Qualification CRM** (`/leads/qualify`): Qualify leads as they come in
- **GHL Webhook intake** (`/api/webhooks/ghl`): Auto-ingests leads from GoHighLevel
- **4 Leads alerts**: CPL Spike, Qualification Rate Drop, Response Time Slow, + 1 more
- **AI Analyst (Leads channel)**: Conversational analysis of funnel data
- **Two modes**: `full_funnel` (with appointment + attendance) vs `whatsapp_simple` (no appointment)

### Funnel Calculator
Brain includes a **Reverse Funnel Calculator** that works backward from revenue target:
```
Revenue target → Required closes → Required qualified leads → Required total leads → Required budget
```

## Client Types
1. **PSL (Professional Services — High Ticket)**: Fertility clinics, MBA programs, cosmetic surgery. Long cycle, needs nurturing. CPL matters less than close rate.
2. **BSL (Business Services — B2B)**: Software, consulting, wholesale. Decision involves multiple people. Nurturing critical.
3. **Restaurants with reservations**: Short cycle, high volume. CPL must be very low. WhatsApp preferred.
4. **WhatsApp-first e-commerce**: Sells via WhatsApp, not cart. Hybrid model.

## Funnel Architecture
```
SHORT FUNNEL (2-3 steps): Low ticket, simple service
  Ad → Landing/Form → Conversion

MEDIUM FUNNEL (3-4 steps): Medium ticket, some consideration
  Ad → Educational landing → Form → Contact

LONG FUNNEL (4-6 steps): High ticket, trust-dependent
  Ad → Value content landing → Form → Thank you page
  → Email nurturing → Call/consultation
```

## KPI Benchmarks
| KPI | 🔴 Alert | 🟡 Improvable | 🟢 Good |
|-----|---------|--------------|---------|
| CPL (Meta) | >$30 | $15-30 | <$15 |
| Form completion rate | <10% | 10-25% | >25% |
| Lead → Qualified rate | <20% | 20-40% | >40% |
| Qualified → Close rate | <10% | 10-25% | >25% |
| Response time | >2h | 30min-2h | <30min |
| WhatsApp open rate | <60% | 60-80% | >80% |

## Form Design Rules
- Ask ONLY what you need to qualify. Every extra field = -5% completions
- Name + Phone + one qualifying question (max)
- For high ticket: 3-5 fields OK (filters low-quality leads)
- Always include next-step expectation ("Te contactamos en menos de 24hs")
- Native Meta forms vs landing: native has higher volume, landing has higher quality

## WhatsApp Pipeline Management
```
NEW LEAD (0-5 min): First contact, reference the form, one question to open conversation
NO RESPONSE (24h): Follow-up with value add, not pressure
LAST ATTEMPT (Day 5): Friendly close, leave door open
QUALIFIED: Move to sales process / appointment
NOT QUALIFIED: Tag and exclude from remarketing
```

## Nurturing Strategy (for long-cycle leads)
- Email sequence: 5-7 emails over 14-21 days
- Content: educate → build trust → show results → soft CTA → hard CTA
- WhatsApp: complementary touchpoints at key moments
- Key: every email must have a reason to exist. No filler.

## VSL (Video Sales Letter) Strategy
For high-ticket services that need trust-building:
```
STRUCTURE:
  1. Hook (0-15s): Pain point or aspirational outcome
  2. Problem (15-60s): Deepen the problem, show understanding
  3. Solution (60-120s): Present the service as the answer
  4. Proof (120-180s): Testimonials, results, credentials
  5. CTA (180-210s): Clear next step (form, WhatsApp, call)

LANDING PAGE:
  VSL on top → Key benefits below → Testimonials → Form
  No navigation. One CTA. Mobile-first.
```
