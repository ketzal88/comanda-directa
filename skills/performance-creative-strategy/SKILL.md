---
name: performance-creative-strategy
description: Use when generating ad hooks, diagnosing creative fatigue, building hook matrices, analyzing creative angles, planning creative testing roadmaps, or identifying underexplored psychological angles in Meta/TikTok paid social campaigns
---

# Performance Creative Strategy

## Overview

A creative operating system for paid social (Meta / TikTok) built on three interlocked frameworks:
- **Reiss × Schwartz Matrix**: 16 human desires × 5 awareness levels → 30 hooks per product
- **Pattern Interrupt Typology**: 5 visual techniques that reset scroll behavior
- **Creative Fatigue Diagnosis**: distinguishes creative exhaustion from audience saturation from auction volatility

Core principle: **the creative IS the targeting**. Andromeda (Meta's delivery engine) uses the creative to find the audience, not the other way around.

---

## When to Use

- Generating hooks or ad concepts for a client
- Client asks "qué creativos hacer" or "necesitamos ideas nuevas"
- Diagnosing why performance is declining (fatigue vs saturation vs offer)
- Planning a 30-day creative testing roadmap
- Identifying which psychological angles are oversaturated in the current portfolio
- Building a hook diversity matrix from scratch

**Don't use for:** media buying optimization (bids, budgets, audiences) → use `paid-ads` skill instead.

---

## Quick Reference: Framework Stack

| Layer | Framework | What it does |
|---|---|---|
| Motivation | Reiss 16 Desires | Why people buy (deep psychological driver) |
| Audience state | Schwartz 5 Levels | What the audience knows/feels right now |
| Hook mechanics | Pattern Interrupt | How to stop the scroll in the first second |
| Copy angle | Pain vs Gain rule | Which emotional direction to take by level |
| Performance | 6-Factor scoring | How to predict and compare creative output |
| Longevity | Fatigue Lifecycle | When and why performance drops |

---

## Pattern Interrupt Typology (quick ref)

| Type | Mechanic | Best format |
|---|---|---|
| `visual-shock` | High contrast, unexpected element, fast movement | Video, UGC |
| `curiosity-gap` | Question left open, loop not closed | Notes App, text-over-video |
| `contrarian` | Statement that contradicts what the feed expects | Static, tweet screenshot |
| `authority` | Specific stat or credential in second 0-2 | Testimonial card, talking head |
| `social-proof` | Massive volume of proof visible immediately | Carousel, user collage |

---

## Hook Architecture (6-part structure)

Every performing ad follows:
```
Hook → Pattern Interrupt → Story/Proof → Payoff → Offer → CTA
```

For video: **3 simultaneous hooks in second 0** are mandatory:
1. **Verbal** (`<5 seg`): INTERRUPCIÓN + PROMESA + CURIOSIDAD
2. **Visual** (`1-2 seg`): movement, unexpected angle, gesture
3. **Textual** (on screen): max 5 words, high contrast

> Full hook catalog and reel script structures → `references/hook-frameworks.md`

---

## Pain vs Gain Rule (Schwartz)

| Schwartz Level | Audience state | Angle |
|---|---|---|
| 1 - Inconsciente | Doesn't know problem exists | **PAIN** — show consequence they hadn't seen |
| 2 - Problema | Knows problem, no solution | **PAIN** — agitate, validate frustration |
| 3 - Solución | Looking for solutions | **GAIN** — differentiate the category |
| 4 - Producto | Knows your product | **GAIN** — social proof, resolve objections |
| 5 - Decisión | Ready to buy | **GAIN + urgency** — final push, guarantee, scarcity |

**Critical rule:** Levels 1-2 = PAIN/avoid framing. Levels 3-5 = GAIN/achieve framing. Never mix.

> Full Reiss desires table + matrix building instructions → `references/reiss-schwartz.md`

---

## 6 Performance Factors (score 1-5 each)

1. **Scroll stopping power** — visual hook impact in first second
2. **Psychological trigger** — urgency / trust / excitement / fear / curiosity
3. **Problem awareness level** — Schwartz 1-5
4. **Offer clarity** — is the value proposition obvious in <3 sec?
5. **Visual pattern interrupt strength** — which type, how disruptive
6. **Message novelty vs category saturation** — is this angle overused in the niche?

---

## Creative Fatigue Quick Diagnosis

| Signals | Probable cause | Action |
|---|---|---|
| Frequency >3 + CTR dropping + CPM rising | **Audience saturation** | Expand targeting, new lookalike |
| Frequency >3 + Thumbstop dropping + CTR stable | **Hook fatigue** | Rotate hooks, keep offer/CTA |
| CPM rising + CTR stable + CVR dropping | **Auction volatility** | Wait 3-5 days, change nothing |
| CTR high (>1.5%) + CVR low (<1%) | **Offer or LP mismatch** | Test offer, audit landing page |
| Thumbstop <20% + CTR <0.5% | **Creative doesn't compete** | New concept from scratch |

> Full lifecycle model (days 1-7-14-30+) → `references/creative-fatigue.md`

---

## Deliverable Templates

### Hook Matrix (activate with: "generá una matriz", "diversificación")
- PASO 1: Select 3 Reiss desires most relevant to product
- PASO 2: Define 2 buyer profiles (different motivations, same product)
- PASO 3: Generate 6×5 table = 30 hooks (each cell: quote + angle)
- PASO 4: List top 5 for cold + top 5 for retargeting

### Creative Brief (14 pieces)
Each piece must declare: Reiss desire + Schwartz level + Pain/Gain angle + Pattern interrupt + Fatigue prediction

### Testing Roadmap (30 days)
- Week 1: New concept angles (different Reiss desires)
- Week 2: Hook variations on winning concept
- Week 3: Pattern interrupt variations
- Week 4: Offer positioning experiments

---

## Related Skills

- `meta-ads-creative`: Format selection, 6 elements, production specs
- `paid-ads`: Media buying, bidding, audience targeting
- `meta-api-expert`: API integration, data fetching
