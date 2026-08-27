---
name: paid-ads-meta
description: Consolidated expertise for Meta Ads creative, campaign management via API, performance creative strategy, paid media operations, ad design, and general paid advertising across platforms. Includes the GEM + Andromeda + Diversity Score framework (recalibrated 2026: concept diversity over format, angle as primary testing axis, real Andromeda retrieval mechanics) for building diversified Spanish-language creative briefs in dark-themed HTML. Use when creating ad concepts, writing copy, diagnosing campaign performance, building Meta campaigns programmatically, optimizing paid media strategy, or producing creative briefs with GEM/Andromeda/Diversity Score. Part 0 covers the upstream research the angles come from: the 5 sources mapped to Worker Brain tools, the literal customer phrase bank, the persona gap map (who the running ads talk to vs who actually buys), and how to read ad age in the Meta Ad Library.
---

# Paid Ads & Meta Ads — Knowledge Base

This document consolidates expertise across Meta Ads creative, campaign management, API integration, performance strategy, and paid media operations.

---

# PARTE 0: DE DÓNDE SALEN LOS ÁNGULOS (research previo)

El resto de este documento cubre cómo se arma, se distribuye y se mide el lote. Esta parte cubre de dónde sale la materia prima. Sin research, los ángulos se inventan y el Diversity Score de la 8.3 termina midiendo la variedad de las invenciones.

## 0.1 — Las 5 fuentes, en orden de confiabilidad

| # | Fuente | De dónde se saca en Worker | Qué se busca |
|---|--------|---------------------------|--------------|
| **1** | **Datos de la cuenta** | `get_creative_performance`, `get_active_ads`, `get_client_brief`, `get_customer_intelligence` | Qué ángulos ya convierten y cuáles abren embudo (spend alto con ROAS propio bajo = TOFU ganador, ver 9.4). Es la fuente más confiable que existe: son compradores reales votando con plata. |
| **2** | **El mercado** | Reviews propias y de la competencia, comentarios, DMs, chats de WhatsApp/CTWA, `get_social_listening` | Las palabras textuales del cliente y las objeciones reales. Alimenta el banco de frases (0.2). |
| **3** | **El producto** | Brief del cliente, landing, catálogo | Qué resuelve, qué evita, qué reemplaza, qué hace distinto. |
| **4** | **El contexto de uso** | Reviews y chats, otra vez | Cuándo lo usan, para qué, qué pasa antes y qué pasa después. Casi todos los ángulos de "momento" salen de acá. |
| **5** | **La competencia** | `get_competitor_intel` + Biblioteca de Anuncios (0.4) | Qué repiten todos (saturado), qué nadie dice (hueco). |

**El gate no bloquea, avisa.** Si el cliente es nuevo o no hay corpus de mercado, se genera igual, pero el brief abre declarando *"ángulos sin validar: no hay datos de cuenta ni material de mercado"*. Mismo criterio que `slack/resumen.md`: se trabaja sin él y se avisa, nunca se inventa el dato faltante.

## 0.2 — Banco de frases del cliente

Antes de escribir un solo ángulo, juntar 8-10 frases **textuales**. Textuales, no parafraseadas: *"comprar 4 bidones por mes se me hace un presupuesto"* sirve; *"les preocupa el precio"* no sirve para nada.

De dónde salen, por rendimiento: primeras líneas de chats CTWA (ver el prefill: quién escribió esa primera línea parte el corpus en dos poblaciones distintas), reviews de la competencia (ahí están las objeciones de toda la categoría, no solo las tuyas), DMs, comentarios.

Estas frases son el insumo directo de los ganchos de 9.3, sobre todo de *agitación de problema* y *confrontación de precio*. Un gancho escrito con la palabra del cliente rinde más que uno escrito con la palabra de la marca, y además le da a Andromeda un texto que sí puede leer para inferir a quién servírselo (9.1, implicancia 4).

## 0.3 — Mapa de brecha de personas

El cruce más barato del research y el que más ángulos nuevos produce. Son dos preguntas:

1. **¿A quién le hablan los creativos que están corriendo?** Los propios con `get_active_ads`, los de la competencia en la Ads Library. Eso da la **persona inferida**.
2. **¿Quién compra de verdad?** `get_customer_intelligence`, reviews, chats. Eso da la **persona real**.

Donde las dos no coinciden hay un comprador al que nadie le está hablando de frente. Esa brecha *es* el ángulo. Las dos formas típicas:

- Tus ads le hablan al perfil A y las reviews son casi todas del perfil B → tenés demanda que estás atendiendo de casualidad, y un ángulo listo para escribir.
- La categoría entera le habla al perfil A y el que compra es el B → territorio libre, nadie lo está pagando.

Las personas se definen **por problema, no por demografía** (regla de 8.3).

## 0.4 — Cómo se lee la Biblioteca de Anuncios

Pedir siempre la **URL exacta** de la biblioteca de esa página. Con el nombre de la marca solo es fácil agarrar la página equivocada y analizar a otro.

Qué leer, en orden de valor:

1. **Antigüedad del anuncio.** Un ad activo hace 100+ días es un ganador confirmado: nadie deja prendido un perdedor tres meses. Los más viejos que siguen activos muestran qué ángulo les funciona de verdad. Es el equivalente externo del *amount spent* de 9.4.
2. **Pilares de mensaje:** las 3-4 ideas que repiten en todos sus ads. Eso está saturado. No ir ahí.
3. **Formatos:** proporción video/imagen, duración, uso de creators (partnership ads).
4. **Persona inferida:** insumo del mapa de 0.3.

Cuidado con la lectura ingenua: la Ads Library muestra lo que la competencia **paga por correr**, no lo que le funciona. La única señal de performance que da gratis es la antigüedad. Un anuncio nuevo no dice nada.

## 0.5 — Un perfil por pasada de research

Si aparecen 2+ perfiles compradores distintos, no mezclarlos en la misma pasada: los insights se promedian y salen ángulos genéricos. Una pasada por perfil. Después el lote sí puede combinarlos, porque la persona es el eje 3 de diversidad en 8.3.

Si el cliente contesta *"le vendemos a todo el mundo"*, frenar y pedir las últimas 5 ventas con el motivo de cada una. "Todo el mundo" no produce ángulos, produce genéricos, y el genérico es exactamente lo que Andromeda no sabe a quién servir.

---

# PART 1: META ADS CREATIVE

## Purpose
Create Meta ad creative that converts using **research-driven development**, the **6 Elements framework**, and **format fitting** — matching message to proven ad formats.

**Core Philosophy:** The best Meta ads don't look like ads. Lo-fi > polished. Authentic > produced. Native > interruptive.

## The Value Formula

**Value = Dream Outcome × Perceived Likelihood / Time Delay × Effort**

Every ad must communicate: (1) What transformation they want, (2) Will it work for them, (3) How long until results, (4) How hard is it.

---

## The 6 Elements of Meta Ad Creative

Every Meta ad has 6 elements:

| Element | Purpose | Key Guidance |
|---------|---------|--------------|
| **Media** | Stop the scroll (80% of performance) | iPhone footage > professional. Faces > stock. |
| **Primary Text** | Hook + body copy above media | First 125 chars show before "See More" |
| **Headline** | Short promise below media | 5-8 words max |
| **Description** | Secondary text below headline | Urgency, proof, or clarification |
| **CTA Button** | Action button | "Learn More" (cold) / "Apply Now" (warm) |
| **Page** | Landing destination | Message must match ad |

### Element 1: MEDIA

**The 80/20 Rule:** Media and Primary Text drive ~80% of performance.

**Media Types:**
- **Static Image:** 1080×1080 (square) or 1080×1350 (4:5 vertical)
- **Video:** 15-60s optimal, 9:16 vertical preferred
- **Carousel:** Up to 10 cards, each 1080×1080

**Lo-Fi Advantages:** Feels native, triggers "real person" trust, no ad blindness, faster iteration.

**Lo-fi characteristics:** iPhone footage, natural lighting, authentic settings (home, car, kitchen), real people not models, imperfect = relatable.

**First Frame Rules (video):**
1. Stop the scroll — pattern interrupt or curiosity
2. Communicate context — what is this about?
3. Promise value — why should I watch?

**Visual Hook Types:**
- **Face hooks:** Person looking at camera, expressive emotion
- **Text hooks:** Bold text overlay, question or statement
- **Setting hooks:** Unusual location, relatable situation, before/after visual
- **Action hooks:** Movement in first frame, unboxing, revealing

**Spec Reference:**

| Format | Aspect Ratio | Recommended Size | Max Length |
|--------|--------------|------------------|------------|
| Feed Image | 1:1 or 4:5 | 1080×1080 or 1080×1350 | N/A |
| Feed Video | 1:1, 4:5, or 9:16 | 1080×1080+ | 15-60s optimal |
| Stories | 9:16 | 1080×1920 | 15s per story |
| Reels | 9:16 | 1080×1920 | 90s max |
| Carousel | 1:1 | 1080×1080 | 10 cards max |

### Element 2: PRIMARY TEXT

**Structure:**
```
[HOOK - First 1-2 sentences, must stop scroll]
[BODY - Expand, build desire, handle objections]
[BRIDGE - Connect to the offer/CTA]
```

**Character Limits:** First ~125 characters visible before "See More". Total ~2,200 characters. Optimal: 250-500 characters.

**Hook formulas:**
```
"[Surprising result] - here's how..."
"I was [before state]. Then [discovery]..."
"Nobody talks about [hidden truth]..."
"If you're [problem state], read this..."
"[Number] [audience] discovered [thing]..."
```

**Body techniques:** Specific numbers and outcomes, testimonial quotes, before/after contrasts, feature → benefit translations, objection anticipation.

**Bridge (final 1-2 sentences):** Connect copy to CTA — "Join 5,000+ families who discovered a better way."

### Element 3: HEADLINE

**Length:** 5-8 words maximum (~40 characters)

**Headline Formulas:**
```
"[Outcome] Without [Obstacle]" → "Quality Education Without the Cost"
"[Desired State] Made [Easy/Possible]" → "Results Made Possible"
"From [Before] to [After]" → "From Stressed to Thriving"
"Join [Number]+ [Audience]"
```

### Element 4: DESCRIPTION

**Character Limit:** ~30 characters visible on mobile. Keep it SHORT.

**Uses:** Urgency/timing ("Apply for Fall 2026"), Social proof ("5,000+ clients enrolled"), Clarification ("5-minute application"), Friction reduction ("Free to apply").

### Element 5: CTA BUTTON

| Audience Temperature | Best CTAs |
|---------------------|-----------|
| Cold (unaware) | Learn More, See More |
| Warm (considering) | Sign Up, Get Started |
| Hot (ready) | Apply Now, Buy Now |

### Element 6: LANDING PAGE

**The #1 rule:** Landing page headline should mirror the ad.

**Key principles:**
- Single focus — one CTA, one action
- Mobile first — 80%+ of Meta traffic is mobile
- Above the fold — CTA visible without scrolling
- Proof elements — testimonials near CTA
- Fast loading (<3 seconds)

---

## The 4-Phase Creative Workflow

### Phase 1: Research
Mine: testimonials/reviews (exact language), support tickets (objections), Reddit/Facebook groups, competitor ads running 30+ days, top organic posts.

### Phase 2: Copywriting — Awareness Level Matching

| Level | Audience State | Copy Approach |
|-------|----------------|---------------|
| 1 - Unaware | Don't know problem exists | Lead with problem agitation |
| 2 - Problem Aware | Know problem, not solutions | Validate + introduce solution |
| 3 - Solution Aware | Know solutions, not you | Differentiate your approach |
| 4 - Product Aware | Know you, haven't acted | Address objections, provide proof |
| 5 - Fully Aware | Ready to act | Make offer irresistible |

### Phase 3: Format Selection

**Lo-Fi Native Formats (High Performance):**

| Format | Why It Works | Best For |
|--------|--------------|----------|
| Notes App | Looks like personal content | Problem-solution, starter packs |
| Text-Over-Video | Story through text sequence | Transformations, permission |
| Reddit/Tweet Screenshot | Discovery energy | Hot takes, personal stories |
| Instagram Comment | Dialogue/Q&A feel | Addressing objections |
| Meme Formats | Culturally native | Contrasts, humor |
| Testimonial Card | Direct social proof | Warm audiences |

**Format-Audience Matrix:**

| Audience Temp | Best Formats |
|--------------|--------------|
| Cold | Notes App, Meme, Text-Over-Video, Reddit/Tweet |
| Warm | UGC, Testimonial, Carousel, Before/After |
| Hot | Talking Head, Demo, Direct Offer |

### Phase 4: Assembly & Testing

**Document each concept:**
```
## Ad Concept: [Name]
Format: [Selected format]
Audience: [Segment] | Awareness: [Level 1-5]
Media: [Description]
Primary Text: [Full copy]
Headline: [5-8 words]
Description: [Secondary line]
CTA: [Button choice]
Page: [Landing destination]
```

**Testing Variations:**
- Hook Testing: Same format, different opening lines (3-5 versions)
- Format Testing: Same message, different formats (3 versions)
- Angle Testing: Same format, different emotional angles (fear vs hope)

---

## Ad Formats Library

### LO-FI NATIVE FORMATS

**Notes App Format:** Screenshot of iPhone Notes with checklist. Best for problem-solution contrast, before/after comparisons, starter packs.
```
[TITLE IN CAPS]
[Setup/Problem list: items]
[Transition/Pivot]
[Solution/Result list: items]
[Tag line or CTA]
```

**Reddit Post Format:** Styled as Reddit post with upvotes. Best for personal stories, discoveries, community advice.
```
r/[subreddit]
[Post Title]
[Body text - casual, conversational]
[Upvote count] | [Comment count]
```

**Tweet/X Screenshot:** Styled as tweet with engagement metrics. Best for hot takes, personal revelations, viral-style content.
```
@[username]
[Tweet text - max 280 chars ideal]
[Likes | Retweets | Comments]
```

**Instagram Comment Format:** Fake comment with video response. Best for addressing objections, FAQ-style content.
```
[Username]: [Comment/question]
[Video response answering the comment]
```

### UGC FORMATS

**Talking Head (Phone Selfie):**
```
[HOOK - First 3 seconds, bold claim or question]
[SETUP - Quick context/backstory]
[TRANSFORMATION - What changed]
[PROOF - Specific results or outcomes]
[CTA - What to do next]
```
Filming tips: Natural lighting, authentic setting (kitchen, car, office), eye level camera, conversational tone.

**Car Confession Format:** "Okay I have to tell you something..." followed by story/revelation. Best for emotional stories, recent discoveries.

### TEXT-OVER-VIDEO FORMATS

**Quick-Cut Text Sequence:**
```
[Text 1 - Hook/problem] - 1-2 seconds
[Text 2 - Agitate/context] - 1-2 seconds
[Text 3 - Solution hint] - 1-2 seconds
[Text 4 - Reveal] - 2-3 seconds
[Text 5 - CTA] - 2-3 seconds
```

**"This Is Your Sign" Format:**
```
"This is your sign..."
[Pain point or desire]
[Validation]
[Solution reveal]
[Product/brand as answer]
[CTA]
```

**"POV" Format:**
```
"POV: It's [future date]"
[Desired outcome achieved]
[How they got there]
[Your product/service as the key]
[CTA to start now]
```

**"Nobody Talks About" Format:**
```
"Nobody talks about [hidden thing]"
[The insight or truth]
[Why it matters]
[What to do about it]
```

### MEME FORMATS

**Drake Approval:** Two-panel — reject bad option / approve good option. Best for simple contrasts, behavior comparison.

**Expectation vs Reality:** Two-panel contrast. Best for fear addressing, positive surprises.

**This vs That Comparison:** Side-by-side feature matrix. Best for product comparison, old way vs new way.

### TESTIMONIAL FORMATS

**Quote Card:**
```
"[Direct quote - specific outcome or transformation]"
- [Name], [Role/Context]
```

**Video Testimonial Structure:**
```
[INTRO - Who they are, context]
[PROBLEM - What they were facing]
[DISCOVERY - How they found the solution]
[RESULT - Specific outcomes]
[RECOMMENDATION - What they'd tell others]
```

**Montage Testimonial:** Multiple 3-5 second clips from different customers. Best for broad claims, "everyone loves it" energy.

### CAROUSEL FORMATS

**Story Arc Carousel:**
```
Slide 1: Hook/Title
Slide 2: Problem/Setup
Slide 3: Turning point
Slide 4: Solution/Discovery
Slide 5: Outcome/Proof
Slide 6: CTA
```

**List Carousel:** Each slide is one item in a numbered list. Final slide: CTA.

---

## Copywriting Formulas

### PAS (Problem - Agitate - Solution)
```
[PROBLEM - State the pain point clearly]
[AGITATE - Make the problem feel more urgent/painful]
[SOLUTION - Introduce your solution as the answer]
[CTA - What to do next]
```

### AIDA (Attention - Interest - Desire - Action)
```
[ATTENTION - Hook that stops the scroll]
[INTEREST - Build curiosity with benefits/features]
[DESIRE - Create wanting with outcomes/proof]
[ACTION - Clear CTA]
```

### Before-After-Bridge
```
BEFORE: [Current painful state]
AFTER: [Desired outcome achieved]
THE BRIDGE: [Your offer as the connection]
[CTA]
```

### Testimonial Formula
```
"[Direct quote from customer]"
[Context - who they are, what they faced]
[Outcome - specific result]
[Bridge to offer]
[CTA]
```

### Story Formula
```
[HOOK - Intriguing opening]
[SETUP - Quick context]
[CONFLICT - The problem faced]
[TURNING POINT - What changed]
[RESOLUTION - The outcome]
[LESSON/CTA - What this means for reader]
```

### List/Listicle Formula
```
[HOOK - Number + promise]
[LIST - 3-7 items with brief explanations]
[SUMMARY - What this means]
[CTA]
```

### Hook Formulas

**Curiosity Gap:**
```
"Nobody talks about [hidden thing]..."
"The thing no one tells you about [topic]..."
"I discovered something about [topic] that changed everything..."
```

**Transformation:**
```
"My [person] went from [before] to [after]..."
"[Before state] to [after state] in [time]..."
```

**Problem Callout:**
```
"If your [audience] [problem sign], read this..."
"Stop [common mistake]..."
"[Problem]? There's another way..."
```

**Social Proof:**
```
"[Number]+ [audience] discovered..."
"[Result] - here's how..."
"Why [number] [people] are doing [action]..."
```

### Power Words

- **Action:** free, discover, join, access, unlock, get, start
- **Emotion:** finally, imagine, freedom, peace, thriving, relief, hope
- **Proof:** proven, real, thousands, results, transformed, actually, specific
- **Urgency:** now, today, limited, closing, fast, quickly, soon
- **Curiosity:** secret, hidden, nobody knows, discover, revealed, inside

### CTA by Audience Temperature
- **Cold (Low commitment):** "Learn more", "See how it works", "Discover the difference"
- **Warm (Medium):** "Start your journey", "See if you qualify", "Get the details"
- **Hot (High):** "Apply now", "Join today", "Enroll now", "Buy now"

---

## Research Methods

### Meta Ad Library
- Search for competitors and industry brands
- Ads running 30+ days = likely performing; 60+ days = proven winners
- Note: format type, hook style, primary text structure

### TikTok Creative Center
- Filter by region + industry; sort by engagement or conversions
- Look for: hook styles (first 3 seconds), text overlay patterns, UGC formats
- Trending formats that translate to Meta: "Get ready with me", "POV", "Story time", "Nobody talks about"

### Organic Social Research
- Twitter/X: Screenshot-worthy tweet structures, thread openers
- Instagram: Trending Reel formats, carousel structures
- Reddit: Post formats in niche subs, what gets upvoted
- Facebook Groups: What posts get shared and commented on

### Weekly Research Routine
**Daily (15 min):** Scroll feed intentionally (save stops), check one competitor in Ad Library, capture one trending format.

**Weekly (30 min):** TikTok Creative Center for education niche, competitor audit (3-5 brands), synthesize what formats keep appearing.

---

# PART 2: PERFORMANCE CREATIVE STRATEGY

## Overview

A creative operating system for paid social (Meta / TikTok) built on three interlocked frameworks:
- **Reiss × Schwartz Matrix:** 16 human desires × 5 awareness levels → 30 hooks per product
- **Pattern Interrupt Typology:** 5 visual techniques that reset scroll behavior
- **Creative Fatigue Diagnosis:** distinguishes creative exhaustion from audience saturation from auction volatility

**Core principle:** The creative IS the targeting. Meta's delivery engine (Andromeda) uses the creative to find the audience, not the other way around.

---

## Pattern Interrupt Typology

| Type | Mechanic | Best Format |
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

**For video — 3 simultaneous hooks in second 0 are mandatory:**
1. **Verbal** (<5 sec): INTERRUPCIÓN + PROMESA + CURIOSIDAD
2. **Visual** (1-2 sec): movement, unexpected angle, gesture
3. **Textual** (on screen): max 5 words, high contrast

---

## Pain vs Gain Rule (Schwartz Levels)

| Schwartz Level | Audience State | Angle |
|---|---|---|
| 1 - Unaware | Doesn't know problem exists | **PAIN** — show consequence they hadn't seen |
| 2 - Problem Aware | Knows problem, no solution | **PAIN** — agitate, validate frustration |
| 3 - Solution Aware | Looking for solutions | **GAIN** — differentiate the category |
| 4 - Product Aware | Knows your product | **GAIN** — social proof, resolve objections |
| 5 - Decision | Ready to buy | **GAIN + urgency** — final push, guarantee, scarcity |

**Critical rule:** Levels 1-2 = PAIN/avoid framing. Levels 3-5 = GAIN/achieve framing. Never mix.

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

| Signals | Probable Cause | Action |
|---|---|---|
| Frequency >3 + CTR dropping + CPM rising | **Audience saturation** | Expand targeting, new lookalike |
| Frequency >3 + Thumbstop dropping + CTR stable | **Hook fatigue** | Rotate hooks, keep offer/CTA |
| CPM rising + CTR stable + CVR dropping | **Auction volatility** | Wait 3-5 days, change nothing |
| CTR high (>1.5%) + CVR low (<1%) | **Offer or LP mismatch** | Test offer, audit landing page |
| Thumbstop <20% + CTR <0.5% | **Creative doesn't compete** | New concept from scratch |

---

## Deliverable Templates

### Hook Matrix
- STEP 1: Select 3 core desires most relevant to product
- STEP 2: Define 2 buyer profiles (different motivations, same product)
- STEP 3: Generate 6×5 table = 30 hooks (each cell: quote + angle)
- STEP 4: List top 5 for cold + top 5 for retargeting

### Creative Brief (per piece)
Each piece must declare: Core desire + Schwartz level + Pain/Gain angle + Pattern interrupt + Fatigue prediction

### Testing Roadmap (30 days)
- Week 1: New concept angles (different core desires)
- Week 2: Hook variations on winning concept
- Week 3: Pattern interrupt variations
- Week 4: Offer positioning experiments

---

# PART 3: AD DESIGN KNOWLEDGE

## Video Ad Structure
```
0-3 seconds: HOOK (stop the scroll)
  → Visual disruption, question, relatable situation, surprising result
  → Must work WITHOUT sound (subtitles mandatory)

3-15 seconds: VALUE (why keep watching)
  → Product demo, benefit explanation, social proof
  → One clear message, not three

15-25 seconds: CTA (what to do next)
  → Clear action, urgency if authentic, offer if applicable
  → Verbal + visual CTA

TOTAL: 15-30 seconds ideal for Meta Ads
```

## Creative Metrics (What They Mean for Design)

| Metric | What It Measures | Designer Action |
|--------|-----------------|----------------|
| **Hook Rate** (3s views / impressions) | First 3 seconds stop the scroll | Change opening visual, text overlay, movement |
| **Hold Rate** (ThruPlay / 3s views) | Middle section keeps attention | Improve pacing, add value props, testimonials |
| **Completion Rate** (p100 / plays) | Full video viewed | Keep under 30s |
| **Drop-off Point** | Where audience leaves | Shows p25/p50/p75/p100. Fix weakest transition. |
| **CTR** | Click-through to site | CTA clarity, urgency, offer visibility |

## Hook Types That Work
1. **Relatable situation:** "POV: cuando..." + daily scenario
2. **Impactful result:** Before/after, transformation
3. **Pain question:** "¿Te pasa que...?" touching a real frustration
4. **Surprising data:** Counter-intuitive fact or number
5. **Product in action:** Direct demo that shows the benefit

## Format Guidelines
- **Video 9:16:** Primary for Reels/Stories. Hook in first 2s.
- **Image 1:1:** Feed placement. Product visible, minimal text, clear CTA.
- **Carousel:** Educational or multi-product. First slide is the hook.
- **Catalog/DPA:** Auto-generated from feed. Focus on product image quality.

## AI Tools for Production

| Tool | Best For |
|------|---------|
| Highfield | Product photos with AI backgrounds |
| Freepik AI | Lifestyle images, mockups, seasonal backgrounds |
| CapCut AI | Auto-captions, auto-reframe (16:9→9:16), background remove |
| Adobe Firefly | Generative fill/expand in Photoshop |
| Claude | Hook concepts, headlines, copy variants |

---

# PART 4: PAID MEDIA OPERATIONS

## Role Definition
Operates and optimizes Meta Ads and Google Ads campaigns for e-commerce clients. Performance measured by ROAS, CPA, CTR, creative frequency, and creative diversity.

## GEM Framework (Meta Ads)
Meta's ad delivery: **G**enerate candidates → **E**stimate value per impression → **M**aximize total value.
- **G (Generation):** Structure and creative diversity determine the candidate pool
- **E (Estimation):** Signal quality (Pixel + CAPI + EMQ) determines prediction accuracy
- **M (Maximization):** Algorithm optimizes for the objective — wrong objective = wrong optimization

### Andromeda (Creative Ranking)
Meta's creative ranking system scores each ad per impression. Key inputs:
- **Signal quality:** EMQ >7 is critical. Below 5 = algorithm is guessing
- **Creative diversity:** More distinct creatives = more candidates = better optimization
- **Frequency control:** High frequency = audience saturation = declining marginal value

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
- Scale +20-30%, wait 3-5 days before next increase

### When to Pause/Rotate
- Frequency >4 in 7 days + CPA rising
- Hook Rate <20% with >$50 spend
- Creative classified as inefficient after statistical significance

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

| KPI | 🔴 Bad | 🟡 OK | 🟢 Good |
|-----|--------|-------|---------|
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
- **CPM high + CTR low** → Expensive audience + weak creative (double problem)
- **pMax ROAS very high + Search Non-brand ROAS low** → pMax stealing brand queries

---

# PART 5: META ADS API EXPERT

## Core Concepts

- **Graph API Structure:** Everything is a node (Ad Account, Campaign, Ad Set, Ad) connected by edges
- **Insights API:** A specialized edge for performance data
- **Metadata Discovery:** Metadata is dynamic — always verify available fields before requesting large sets

## Strategic Workflow

1. **Dynamic Field Discovery:** Call `GET /act_{ID}/insights?metadata=1` once per API version and cache results
2. **Error-Driven Auto-Depuration:** If request fails with `(#100)`, remove offending field and retry
3. **Block-Based Requests:** Divide metrics into blocks (Base, Video, Engagement, Conversion) for cleaner debugging
4. **Action Mapping:** `actions` and `action_values` return arrays — map `action_type` values to internal dictionary

## Hierarchy & Operations

### 1. Campaigns (`/campaigns`)
- **Key Fields:** `id`, `name`, `status`, `effective_status`, `objective`, `buying_type`, `daily_budget`
- **Creation:** `POST /act_{ID}/campaigns` requiring `name`, `objective`, `buying_type`

### 2. Ad Sets (`/adsets`)
- **Key Fields:** `id`, `name`, `billing_event`, `optimization_goal`, `targeting`, `bid_strategy`
- **Relationship:** Always linked to a `campaign_id`

### 3. Ads & Creatives (`/ads`, `/adcreatives`)
- **Key Fields:** `creative`, `tracking_specs`, `image_url`, `video_id`, `body`
- **Workflow:** Create `AdCreative` first, then create `Ad` referencing the `creative_id`

## Insights Fields Reference

### Delivery & Reach
`impressions`, `reach`, `frequency`, `unique_clicks`, `unique_ctr`, `estimated_ad_recallers`, `quality_ranking`, `engagement_rate_ranking`, `conversion_rate_ranking`

### Cost & Spend
`spend`, `cpm`, `cpc`, `cpp`, `cost_per_unique_click`, `cost_per_inline_link_click`, `cost_per_action_type`

### Click Metrics
`clicks`, `inline_link_clicks`, `outbound_clicks`, `outbound_clicks_ctr`, `inline_link_click_ctr`, `ctr`, `unique_outbound_clicks`

### Engagement
`actions`, `action_values`, `video_avg_time_watched_actions`, `video_play_actions`, `video_p25_watched_actions`, `video_p50_watched_actions`, `video_p75_watched_actions`, `video_p95_watched_actions`, `video_p100_watched_actions`, `video_30_sec_watched_actions`, `post_engagement`, `post_reactions`, `post_comments`, `post_shares`

### Conversion / Commerce
`conversions`, `conversion_values`, `website_purchase_roas`, `purchase_roas`, `website_ctr`, `website_purchase`, `website_leads`, `website_add_to_cart`, `website_initiate_checkout`, `website_view_content`, `website_complete_registration`, `cost_per_conversion`

### Attribution / Window-sensitive
`attributed_conversions`, `attributed_conversion_values`, `conversion_rate`, `roas`, `cost_per_result`, `results`

### Derived Metrics (Calculated — NOT API fields)
- `hook_rate` = `video_3s_views` / `impressions`
- `retention_rate` = `video_p50` / `video_3s_views`
- `cpa` = `spend` / `conversions`
- `roas` = `conversion_value` / `spend`

### ⚠️ Forbidden / Non-Existent Fields
Do NOT request: `inline_video_view_2s`, `video_2s_watched`, `website_roas` (use `website_purchase_roas`), `leads` (contained within `actions`)

## Rate Limits & Best Practices

- **Account Score:** Reads = 1pt, Writes = 3pts
- **Budget Changes:** Max 4 changes per hour per Ad Set
- **Exponential Backoff:** Mandatory for error code 613 (Rate Limit)
- **Batching:** Use batch requests or async jobs for large data exports

## Advanced Insights

### Attribution Windows
Specify explicitly for consistent reporting:
- `1d_click`, `7d_click`, `1d_view`, `28d_click` (legacy)

### Async Reporting (`async=true`)
For large datasets:
1. Initialize: `POST /{object_id}/insights?async=true&fields=...`
2. Poll: `GET /{report_run_id}`
3. Retrieve: Once `async_status` is `Job Completed`, fetch results

### Breakdowns
Slice data by: `age`, `gender`, `country`, `region`, `publisher_platform`, `platform_position`, `device_platform`, `time_increment=1` (daily)

> ⚠️ Breakdowns multiply rows significantly — can lead to rate limit saturation

### Field Expansions
Retrieve parent/child data in a single call:
`GET /act_{ID}/ads?fields=name,insights{impressions,spend},campaign{name},adset{name}`

## Implementation Patterns (TypeScript)

### Dynamic Field Validation with Auto-Depuration
```typescript
async function fetchInsightsWithRetry(objectId: string, fields: string[], accessToken: string) {
  let currentFields = [...fields];
  
  while (currentFields.length > 0) {
    try {
      const url = `https://graph.facebook.com/v18.0/${objectId}/insights?fields=${currentFields.join(',')}&access_token=${accessToken}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error && data.error.code === 100) {
        const match = data.error.message.match(/([^ ]+) is not valid for fields param/);
        if (match) {
          const invalidField = match[1];
          currentFields = currentFields.filter(f => f !== invalidField);
          continue;
        }
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
}
```

### Handling Action Arrays
```typescript
function getMetricFromActions(actions: any[], type: string): number {
  return actions
    .filter(a => a.action_type === type)
    .reduce((sum, a) => sum + parseInt(a.value || "0"), 0);
}

// Example usage:
const purchases = getMetricFromActions(data.actions, 'purchase');
const leads = getMetricFromActions(data.actions, 'lead');
```

---

# PART 6: META CAMPAIGN BUILDER (API)

## Critical API Helper Pattern

```typescript
const BASE_URL = 'https://graph.facebook.com/v18.0'
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN

async function api(path: string, method: 'GET' | 'POST' = 'GET', body?: Record<string, any>) {
  const url = `${BASE_URL}${path}`

  if (method === 'GET') {
    const sep = url.includes('?') ? '&' : '?'
    const res = await fetch(`${url}${sep}access_token=${encodeURIComponent(ACCESS_TOKEN)}`)
    const data = await res.json() as any
    if (data.error) throw new Error(`[GET ${path}] ${data.error.message}`)
    return data
  }

  const form = new URLSearchParams()
  form.append('access_token', ACCESS_TOKEN)
  for (const [k, v] of Object.entries(body || {})) {
    form.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
  }
  const res = await fetch(url, { method: 'POST', body: form })
  const data = await res.json() as any
  if (data.error) throw new Error(`[POST ${path}] ${data.error.message}`)
  return data
}
```

## Step 1 — Get Page ID

`/me/accounts` often returns empty for system user tokens. Use business-level lookup:

```typescript
const biz = await api('/me/businesses?fields=id,name')
const pages = await api(`/${biz.data[0].id}/owned_pages?fields=id,name`)
const pageId = pages.data[0].id
```

## Step 2 — Fetch Assets from Ad Account

Assets MUST be in the **specific ad account** (`act_XXXXX`), NOT the Business Asset Library.

```typescript
const videos = await api(`/${AD_ACCOUNT}/advideos?fields=id,title&limit=200`)
const images = await api(`/${AD_ACCOUNT}/adimages?fields=hash,name&limit=200`)

const norm = (s: string) => s.replace(/\.[^.]+$/, '').toLowerCase().trim()
const findVideo = (search: string) =>
  videos.data.find(v => norm(v.title).includes(norm(search)))?.id
```

> ⚠️ If library shows 0 results: user uploaded to Business Asset Library instead of ad account. They need to upload via Ads Manager → Media Library for the specific account.

## Step 3 — Create Campaign

| Objective | API Value | Use For |
|---|---|---|
| Conversions (sales) | `OUTCOME_SALES` | Purchase, pixel events |
| Leads | `OUTCOME_LEADS` | Lead gen, appointment booking |
| WhatsApp / Messaging | `OUTCOME_ENGAGEMENT` | WhatsApp click-to-chat |
| Traffic | `OUTCOME_TRAFFIC` | Link clicks |
| Awareness | `OUTCOME_AWARENESS` | Reach, brand |

```typescript
const campaign = await api(`/${AD_ACCOUNT}/campaigns`, 'POST', {
  name: 'Campaign Name',
  objective: 'OUTCOME_SALES',
  status: 'PAUSED',
  buying_type: 'AUCTION',
  special_ad_categories: [],
})
```

## Step 4 — Create Ad Sets

### ⚠️ Required Fields (missing any = Invalid parameter)

| Field | Value | Notes |
|---|---|---|
| `bid_strategy` | `LOWEST_COST_WITHOUT_CAP` | Always required |
| `targeting_automation` | `{ advantage_audience: 0 }` | Must be INSIDE targeting object |
| `facebook_positions` | `['feed', 'story', 'facebook_reels']` | Use `facebook_reels`, NOT `reels` |
| `instagram_positions` | `['stream', 'story', 'reels']` | `reels` is valid here |
| `billing_event` | `IMPRESSIONS` | Standard for conversion objectives |
| `daily_budget` | cents/centavos | $30 USD = 3000 |

### Conversion Event Mapping

| Event | `custom_event_type` | `optimization_goal` |
|---|---|---|
| Purchase | `PURCHASE` | `OFFSITE_CONVERSIONS` |
| Schedule / Booking | `SCHEDULE` | `OFFSITE_CONVERSIONS` |
| Lead | `LEAD` | `OFFSITE_CONVERSIONS` |
| WhatsApp | _(no promoted_object)_ | `CONVERSATIONS` |

### Cold Ad Set (Interests)
```typescript
const coldAdSet = await api(`/${AD_ACCOUNT}/adsets`, 'POST', {
  name: 'Cold — S1',
  campaign_id: campaignId,
  daily_budget: 3000,
  billing_event: 'IMPRESSIONS',
  optimization_goal: 'OFFSITE_CONVERSIONS',
  bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
  promoted_object: {
    pixel_id: PIXEL_ID,
    custom_event_type: 'PURCHASE',
  },
  targeting: {
    geo_locations: { countries: ['AR'] },
    age_min: 28,
    age_max: 55,
    publisher_platforms: ['facebook', 'instagram'],
    facebook_positions: ['feed', 'story', 'facebook_reels'],
    instagram_positions: ['stream', 'story', 'reels'],
    flexible_spec: [
      { interests: [{ id: '6003389760112', name: 'E-commerce' }] }
    ],
    targeting_automation: { advantage_audience: 0 },  // ⚠️ inside targeting
  },
  status: 'PAUSED',
})
```

### WhatsApp Ad Set
```typescript
const waAdSet = await api(`/${AD_ACCOUNT}/adsets`, 'POST', {
  name: 'WhatsApp — Cold',
  campaign_id: campaignId,
  daily_budget: 3000,
  billing_event: 'IMPRESSIONS',
  optimization_goal: 'CONVERSATIONS',
  bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
  targeting: {
    geo_locations: { countries: ['AR'] },
    publisher_platforms: ['facebook', 'instagram'],
    facebook_positions: ['feed', 'story', 'facebook_reels'],
    instagram_positions: ['stream', 'story', 'reels'],
    targeting_automation: { advantage_audience: 0 },
  },
  status: 'PAUSED',
})
```

### Retargeting Ad Set (Custom Audience)
```typescript
const rtgAdSet = await api(`/${AD_ACCOUNT}/adsets`, 'POST', {
  name: 'Retargeting — Video Views 25%',
  campaign_id: campaignId,
  daily_budget: 700,
  billing_event: 'IMPRESSIONS',
  optimization_goal: 'OFFSITE_CONVERSIONS',
  bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
  promoted_object: { pixel_id: PIXEL_ID, custom_event_type: 'PURCHASE' },
  targeting: {
    geo_locations: { countries: ['AR'] },
    publisher_platforms: ['facebook', 'instagram'],
    facebook_positions: ['feed', 'story', 'facebook_reels'],
    instagram_positions: ['stream', 'story', 'reels'],
    custom_audiences: [{ id: audienceId }],
    targeting_automation: { advantage_audience: 0 },
  },
  status: 'PAUSED',
})
```

## Step 5 — Create Custom Audiences

### Video Views 25%+
```typescript
const rule = {
  inclusions: {
    operator: 'or',
    rules: videoIds.map(id => ({
      event_sources: [{ id, type: 'video' }],
      retention_seconds: 2592000,  // 30 days
      filter: {
        operator: 'and',
        filters: [{ field: 'event', operator: 'eq', value: 'video_25_watched' }],
      },
    })),
  },
}

const audience = await api(`/${AD_ACCOUNT}/customaudiences`, 'POST', {
  name: 'Video Views 25% — 30d',
  subtype: 'ENGAGEMENT',
  rule,
})
```

> ⚠️ Video sources must belong to the SAME ad account as the audience.

### Website Visitors (Pixel)
```typescript
const rule = {
  inclusions: {
    operator: 'or',
    rules: [{
      event_sources: [{ id: PIXEL_ID, type: 'pixel' }],
      retention_seconds: 2592000,
      filter: {
        operator: 'and',
        filters: [{ field: 'event', operator: 'eq', value: 'ViewContent' }],
      },
    }],
  },
}
```

## Step 6 — Create Ad Creatives

### Video Creative
```typescript
const thumb = await api(`/${videoId}?fields=picture`)

const creative = await api(`/${AD_ACCOUNT}/adcreatives`, 'POST', {
  name: 'Ad Name — creative',
  object_story_spec: {
    page_id: pageId,
    video_data: {
      video_id: videoId,
      message: primaryText,
      title: headline,
      link_description: description,
      image_url: thumb.picture,  // ⚠️ required
      call_to_action: {
        type: 'SHOP_NOW',  // or BOOK_TRAVEL, LEARN_MORE, SEND_MESSAGE
        value: { link: destinationUrl },
      },
    },
  },
})
```

### Image Creative
```typescript
const creative = await api(`/${AD_ACCOUNT}/adcreatives`, 'POST', {
  name: 'Ad Name — creative',
  object_story_spec: {
    page_id: pageId,
    link_data: {
      image_hash: imageHash,
      link: destinationUrl,
      message: primaryText,
      name: headline,
      description: description,
      call_to_action: {
        type: 'SHOP_NOW',
        value: { link: destinationUrl },
      },
    },
  },
})
```

### WhatsApp Creative
```typescript
const creative = await api(`/${AD_ACCOUNT}/adcreatives`, 'POST', {
  name: 'WhatsApp Ad — creative',
  object_story_spec: {
    page_id: pageId,
    link_data: {
      image_hash: imageHash,
      link: `https://wa.me/${WHATSAPP_NUMBER}`,
      message: primaryText,
      name: headline,
      call_to_action: {
        type: 'WHATSAPP_MESSAGE',
        value: {
          app_destination: 'WHATSAPP',
          link: `https://wa.me/${WHATSAPP_NUMBER}`,
        },
      },
    },
  },
})
```

## Step 7 — Create Ads

```typescript
const ad = await api(`/${AD_ACCOUNT}/ads`, 'POST', {
  name: adName,
  adset_id: adSetId,
  creative: { creative_id: creativeId },
  status: 'PAUSED',
})
```

## UTM Pattern

Estandar Worker: mismo string en todas las cuentas, en `url_tags` del creative (el campo
"Parametros de URL" a nivel anuncio en la UI), sin el `?` adelante.

```
utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_id={{campaign.id}}&utm_content={{ad.name}}&utm_term={{adset.name}}
```

`utm_source=facebook`, nunca `meta`: `meta` no esta en la lista de sitios sociales de GA4 y
el trafico cae en Paid Other en vez de Paid Social. Los nombres de campana, adset y anuncio
se sustituyen crudos, sin encodear — lowercase, guiones, sin `# & ? %` ni emojis.

Excepciones por cliente (lead-gen, Nakiki), donde no aplica (CTWA) y el equivalente de
Google Ads: [`docs/utm-standard.md`](../../docs/utm-standard.md).

## CTA Types Quick Reference

| CTA Label | API Value |
|---|---|
| Book Now | `BOOK_TRAVEL` |
| Shop Now | `SHOP_NOW` |
| Learn More | `LEARN_MORE` |
| Send Message (WhatsApp) | `WHATSAPP_MESSAGE` |
| Sign Up | `SIGN_UP` |
| Contact Us | `CONTACT_US` |
| Get Quote | `GET_QUOTE` |
| Apply Now | `APPLY_NOW` |

## Error Quick Reference

| Error | Cause | Fix |
|---|---|---|
| `Se requiere la marca de público Advantage` | Missing `targeting_automation` | Add `targeting_automation: { advantage_audience: 0 }` INSIDE targeting |
| `Se requiere importe o puja` | Missing `bid_strategy` | Add `bid_strategy: 'LOWEST_COST_WITHOUT_CAP'` |
| `Posición en Facebook no válida: reels` | Wrong placement name | Use `facebook_reels` not `reels` in `facebook_positions` |
| `El anuncio necesita la miniatura` | No thumbnail in video creative | Add `image_url: thumb.picture` to `video_data` |
| `Syntax error "Expected end of string instead of ?"` | Double `?` in GET URL | Use `url.includes('?') ? '&' : '?'` separator |
| `Invalid parameter` (audience) | Cross-account video source | Videos must be in same account as audience |
| `No pages found` | `/me/accounts` fails | Use `/me/businesses` → `/owned_pages` |

---

# PART 7: GENERAL PAID ADS STRATEGY

## Platform Selection Guide

| Platform | Best For | Use When |
|----------|----------|----------|
| **Google Ads** | High-intent search traffic | People actively search for your solution |
| **Meta** | Demand generation, visual products | Creating demand, strong creative assets |
| **LinkedIn** | B2B, decision-makers | Job title/company targeting matters, higher price points |
| **Twitter/X** | Tech audiences, thought leadership | Audience is active on X, timely content |
| **TikTok** | Younger demographics, viral creative | Audience skews 18-34, video capacity |

## Campaign Structure Best Practices

### Account Organization
```
Account
├── Campaign 1: [Objective] - [Audience/Product]
│   ├── Ad Set 1: [Targeting variation]
│   │   ├── Ad 1: [Creative variation A]
│   │   ├── Ad 2: [Creative variation B]
│   │   └── Ad 3: [Creative variation C]
│   └── Ad Set 2: [Targeting variation]
└── Campaign 2...
```

### Naming Conventions
```
[Platform]_[Objective]_[Audience]_[Offer]_[Date]

Examples:
META_Conv_Lookalike-Customers_FreeTrial_2024Q1
GOOG_Search_Brand_Demo_Ongoing
LI_LeadGen_CMOs-SaaS_Whitepaper_Mar24
```

### Budget Allocation

**Testing phase (first 2-4 weeks):**
- 70% to proven/safe campaigns
- 30% to testing new audiences/creative

**Scaling phase:**
- Consolidate into winning combinations
- Increase budgets 20-30% at a time
- Wait 3-5 days between increases for algorithm learning

## Audience Targeting

### Meta Audiences

**Core Audiences:**
- Layer interests with AND logic for precision
- Use Audience Insights to research interests
- Start broad, let algorithm optimize
- Always exclude existing customers

**Custom Audiences:**
- Website visitors (all visitors, specific pages, time thresholds)
- Customer list (upload emails/phone numbers — match rate 30-70%)
- Engagement audiences (video viewers 25%/50%/75%/95%, page/profile engagers, form openers)

**Lookalike Audiences:**
- Source: use high-LTV customers, not all customers (purchasers > leads > all visitors)
- Minimum 100 source users, ideally 1,000+
- Sizes: 1% (most similar) → 1-3% (balance) → 3-5% (broader) → 5-10% (awareness only)
- Layer: Lookalike + interest for precision early; test lookalike-only at scale

### Google Ads Audiences

**Search:**
- Keywords: Exact `[keyword]`, Phrase `"keyword"`, Broad `keyword` + smart bidding
- RLSA: Bid higher on past visitors searching your terms
- Audience layering: Start in "observation" mode, switch to "targeting" for high performers

**Display/YouTube:**
- Custom intent audiences (from converting keywords)
- In-market audiences (actively researching)
- Affinity audiences (interests/habits — better for awareness)
- Customer match + similar audiences

### Audience Size Guidelines

| Platform | Minimum | Ideal Range |
|----------|---------|-------------|
| Google Search | 1,000+ searches/mo | 5,000-50,000 |
| Google Display | 100,000+ | 500K-5M |
| Meta | 100,000+ | 500K-10M |
| LinkedIn | 50,000+ | 100K-500K |
| Twitter/X | 50,000+ | 100K-1M |
| TikTok | 100,000+ | 1M+ |

### Exclusion Strategy (Always Apply)
- Existing customers (unless upsell)
- Recent converters (7-14 days)
- Bounced visitors (<10 sec)
- Employees
- Irrelevant page visitors (careers, support)
- Competitors (if identifiable)

## Key Metrics by Objective

| Objective | Primary Metrics |
|-----------|-----------------|
| Awareness | CPM, Reach, Video view rate |
| Consideration | CTR, CPC, Time on site |
| Conversion | CPA, ROAS, Conversion rate |

## Optimization Levers

**If CPA is too high:**
1. Check landing page (is the problem post-click?)
2. Tighten audience targeting
3. Test new creative angles
4. Improve ad relevance/quality score
5. Adjust bid strategy

**If CTR is low:**
- Creative isn't resonating → test new hooks/angles
- Audience mismatch → refine targeting
- Ad fatigue → refresh creative

**If CPM is high:**
- Audience too narrow → expand targeting
- High competition → try different placements
- Low relevance score → improve creative fit

## Retargeting Strategy

### Funnel-Based Approach

| Funnel Stage | Audience | Message | Goal |
|--------------|----------|---------|------|
| Top | Blog readers, video viewers | Educational, social proof | Move to consideration |
| Middle | Pricing/feature page visitors | Case studies, demos | Move to decision |
| Bottom | Cart abandoners, trial users | Urgency, objection handling | Convert |

### Retargeting Windows

| Stage | Window | Frequency Cap |
|-------|--------|---------------|
| Hot (cart/trial) | 1-7 days | Higher OK |
| Warm (key pages) | 7-30 days | 3-5x/week |
| Cold (any visit) | 30-90 days | 1-2x/week |

## Bid Strategy Progression
1. Start with manual or cost caps
2. Gather conversion data (50+ conversions)
3. Switch to automated with targets based on historical data
4. Monitor and adjust targets based on results

## Reporting & Analysis

### Weekly Review Checklist
- Spend vs. budget pacing
- CPA/ROAS vs. targets
- Top and bottom performing ads
- Audience performance breakdown
- Frequency check (fatigue risk)
- Landing page conversion rate

### Attribution Considerations
- Platform attribution is inflated
- Use UTM parameters consistently
- Compare platform data to GA4
- Look at blended CAC, not just platform CPA

## Meta Ads Setup Checklist

### Business Manager Foundation
- [ ] Business Manager created and verified
- [ ] Ad account created within Business Manager
- [ ] Payment method added
- [ ] Team access configured with proper roles

### Pixel & Tracking
- [ ] Meta Pixel installed on all pages
- [ ] Standard events configured: PageView, ViewContent, Lead, Purchase, AddToCart, InitiateCheckout
- [ ] Conversions API (CAPI) set up for server-side tracking
- [ ] Event Match Quality score > 6
- [ ] Test events in Events Manager

### Domain & Aggregated Events
- [ ] Domain verified in Business Manager
- [ ] Aggregated Event Measurement configured
- [ ] Top 8 events prioritized in order of importance

### Audience Setup
- [ ] Website visitor audiences created (all, 30/60/90/180 days)
- [ ] Video viewers created (25%, 50%, 75%, 95%)
- [ ] Customer list uploaded
- [ ] Lookalike audiences created (1%, 1-3%)

### Creative Assets
- [ ] Images: Feed 1080×1080, Stories/Reels 1080×1920, Landscape 1200×628
- [ ] Videos in correct formats with captions
- [ ] Ad copy variations ready
- [ ] UTM parameters in all destination URLs

### Compliance
- [ ] Special Ad Categories declared if applicable
- [ ] Landing page complies with Meta policies

## Common Mistakes to Avoid

### Strategy
- Launching without conversion tracking
- Too many campaigns (fragmenting budget)
- Not giving algorithms enough learning time (50+ conversions minimum)
- Optimizing for wrong metric

### Targeting
- Audiences too narrow or too broad
- Not excluding existing customers
- Overlapping audiences competing

### Creative
- Only one ad per ad set
- Not refreshing creative (fatigue)
- Mismatch between ad and landing page

### Budget
- Spreading too thin across campaigns
- Making big budget changes (disrupts learning phase)
- Stopping campaigns during learning phase

---

# PART 8: GEM + ANDROMEDA + DIVERSITY SCORE FRAMEWORK

Framework propio para briefs creativos de Meta Ads en castellano. Se usa cuando hay que entregar un lote de piezas (estáticas, reels, carruseles, UGC) diversificado y testeable, no una pieza suelta. El entregable estándar es un HTML standalone dark, sin branding de agencia, con Bebas Neue + Barlow Condensed como tipografía. El cliente lo abre y ve todo el plan creativo en una sola pieza.

Cuando aplicar este framework: el usuario pide un "brief creativo", "bajada creativa", "pack de piezas", "lote de Meta Ads", "creativos para campaña" o menciona explícitamente GEM / Andromeda / Diversity Score. Si pide una sola pieza o un solo concepto, no hace falta el framework completo — usar la Parte 1.

---

## 8.1 — GEM (estructura de cada pieza)

GEM es el esqueleto de copy interno de cada estática, reel o carrusel. Aplica al copy dentro de la pieza, no al primary text del feed.

| Letra | Significado | Rol | Duración / Posición |
|-------|-------------|-----|---------------------|
| **G** | **Gancho** | Parar el scroll | Primeros 0–3s (video) / título visual (estática) / primera card (carrusel) |
| **E** | **Enganche** | Sostener atención, construir deseo, manejar objeciones | 3–10s / cuerpo / cards intermedias |
| **M** | **Mensaje final** | CTA ordenado con beneficio acumulado | Últimos 2s / footer visual / última card |

Cada concepto del brief se documenta con sus 3 componentes G/E/M explícitos. No se mezclan: el Gancho no vende, el Mensaje final no engancha. Si una pieza no puede separarse en G/E/M, está mal estructurada.

**Ejemplos de Gancho por tipo:**
- Pregunta directa: "¿Tu cubrecamas absorbe agua como una esponja?"
- Afirmación contraintuitiva: "Comprar en sale es comprar mal."
- Pattern interrupt visual: cara expresiva mirando a cámara + texto en cap
- Stat / número específico: "73% de las parejas dejan de buscar antes del año"
- Demostración: las dos opciones bajo agua

**Ejemplos de Mensaje final:**
- Beneficio acumulado: "70% OFF + 3 cuotas + envío express → ENTRÁ AL SALE"
- Urgencia operativa (no temporal): "Comprá ahora y te llega mañana"
- Permiso: "No tenés que esperar a la próxima oferta"

---

## 8.2 — ANDROMEDA (distribución funnel)

Andromeda es la distribución del lote en el funnel. Garantiza que el pack cubre las tres temperaturas y no concentra todo en BOFU (error común).

| Fase | Temperatura | Audiencia | Objetivo de la pieza | % del lote típico |
|------|-------------|-----------|----------------------|-------------------|
| **TOFU** | Fría | Broad / intereses / lookalike 1-3% | Atraer, generar curiosidad, instalar problema | 35–45% |
| **MOFU** | Tibia | Visitantes web, video viewers 25–75%, engagers | Educar, diferenciar, manejar objeciones | 30–40% |
| **BOFU** | Caliente | Cart abandoners, ATC, top 25% LTV, lookalike de compradores | Convertir, urgencia legítima, prueba social | 20–30% |

**Reglas de Andromeda:**
- Ningún brief sale con menos del 30% en TOFU (sin TOFU el funnel se seca en 2 semanas)
- BOFU nunca usa hooks fríos ni educativos
- Cada pieza se etiqueta con su fase Andromeda en el brief
- Si el cliente tiene poco budget, el ratio se ajusta a 50/30/20, no se elimina ninguna fase

> **Nota de nomenclatura (2026).** Acá "Andromeda" se usa como distribución del lote en el funnel — es lenguaje interno/cliente y se mantiene. Pero el Andromeda real de Meta es el sistema de retrieval que decide a quién servir leyendo el contenido del creativo. Ese mecanismo es la razón de ser de la recalibración del Diversity Score (8.3) y está explicado en la PARTE 9. Cuando armes el funnel (esta sección) pensá distribución; cuando pienses diversidad del lote, pensá el mecanismo de la PARTE 9.

---

## 8.3 — DIVERSITY SCORE (recalibrado 2026: concepto + psicología)

> **Recalibración 2026.** El Diversity Score ahora mide DOS capas, no una. La capa que de verdad gobierna a quién le llega el lote en Andromeda es la **diversidad de concepto** (persona × ángulo × oferta), no el registro psicológico del copy. Cambiar el formato o el trigger psicológico de una pieza NO la convierte en un creativo distinto a ojos de Meta: si la persona y el ángulo son los mismos, Andromeda las agrupa (bundling), las sirve a la misma gente, la frecuencia sube y el ROAS se cae. El fundamento completo está en la PARTE 9. Acá va el cálculo.

### Capa 1 — Diversidad de concepto (la que importa para Andromeda)

Mide sobre qué eje varía cada concepto respecto del resto del lote. **Orden de impacto (= orden de prioridad de testeo):**

| # | Eje | Por qué pesa | Rol en el lote |
|---|-----|--------------|----------------|
| **1** | **Ángulo** | El argumento/perspectiva es lo que hace que un creativo le hable a otra gente. Es lo de mayor leverage y lo que primero hay que rotar cuando algo no rinde. | **Eje primario obligatorio.** Idealmente cada concepto del lote tiene un ángulo único. |
| **2** | **Oferta** | Cambiar producto, bundle o framing de valor abre otra audiencia. Pero hay techo: con 1–2 productos te quedás sin variantes rápido. | Variar donde el catálogo lo permita. |
| **3** | **Persona** | Quién está en la pieza y a quién le habla. Cambia la audiencia, pero si el ángulo es el mismo el solapamiento sigue siendo alto. | Variar, siempre con personas específicas (ver regla abajo). |
| **4** | **Formato** | Estática / reel / carrusel / UGC. El de **menor** impacto en reach nuevo. Sirve para alcanzar a quien no resuena con un formato, no para diversificar de verdad. | Último recurso de diversidad. Nunca el eje principal. |

**Regla de oro recalibrada:** dos conceptos del lote NO pueden diferir solo en formato ni solo en eje psicológico. Tienen que diferir en **ángulo, oferta o persona** — y preferentemente en el ángulo. Si dos piezas comparten persona + ángulo + oferta, para Andromeda son el mismo creativo: cuentan como UNO. Eso es bandera roja → rediferenciar o fusionar.

**Personas: por problema, no por demografía.** Una persona definida como "profesional 25–45" produce creativo olvidable y no escala. Definila por problema/deseo/trigger: *"consultora que viaja dos veces por semana y necesita un carry-on que sirva para reunión y para after"*, *"mamá que ya probó seis suplementos porque el nene no come verduras"*. Específico = brief mejor = creativo que aguanta más spend. Esto aplica a TODO vertical, fashion y B2B incluidos.

**Cálculo Capa 1:** contar los **conceptos verdaderamente distintos** del lote (los que difieren en ángulo/oferta/persona). Heurística:
- Lote de 6–9 piezas con 5+ ángulos distintos y variación de persona/oferta → Concept Diversity alto.
- Si el lote tiene 8 piezas pero solo 3 ángulos reales (el resto son el mismo concepto en otro formato/trigger) → Concept Diversity bajo: Andromeda va a ver 3 creativos, no 8.
- Declarar en el brief: *"N conceptos distintos sobre M piezas (X ángulos, Y personas, Z ofertas)."*

**Un concepto por ad set.** Como el targeting vive a nivel ad set, mezclar conceptos distintos en un mismo ad set confunde a Meta y mata el aprendizaje (no sabés qué concepto funcionó). La tabla de testing debe poder mapear 1 concepto → 1 ad set.

### Capa 2 — Diversidad psicológica (registro del copy)

Esto es el Diversity Score clásico: que el copy del lote no martille siempre el mismo trigger. Sigue siendo útil para que las piezas no suenen monótonas y para cubrir distintos disparadores de compra — pero es **secundario** a la diversidad de concepto. Dos piezas pueden ser ambas "Funcional" y estar perfectamente diversificadas si atacan personas y ángulos distintos.

### Los 4 ejes

| Eje | Letra | Color usado en briefs | Qué dispara |
|-----|-------|----------------------|-------------|
| **Emocional** | E | dorado / acento marca | Identidad, autoestima, aspiración, miedo, alivio |
| **Funcional** | F | azul | Beneficio concreto, especificación, comparación, ahorro |
| **Social Proof** | S | verde | UGC, reviews, "más vendido", testimonios, autoridad |
| **Urgencia** | U | rojo / naranja | Stock limitado, deadline, oferta temporal, FOMO |

### Cómo se calcula

1. A cada pieza se le asigna un peso porcentual sobre los 4 ejes (suman 100% por pieza). Una pieza puede ser 70% E + 30% F, o 100% S, o 40% F + 30% S + 30% U, etc.
2. Se promedian los pesos sobre todo el lote → ratio consolidado E:F:S:U.
3. **Diversity Score** = 100 menos la penalización por concentración. Como heurística:
   - Si ningún eje supera 40% del total: score 88–95 (óptimo)
   - Si un eje queda entre 40–55%: score 75–87 (aceptable, justificar)
   - Si un eje supera 55%: score < 75 (rehacer mix)
4. Objetivo por defecto: **Diversity Score ≥ 88**, con ratio target alrededor de **28:30:22:20 (E:F:S:U)** para e-commerce general. El ratio se ajusta por vertical (ver más abajo).

### Ratio por vertical (referencia)

| Vertical | E | F | S | U | Notas |
|----------|---|---|---|---|-------|
| Moda / belleza | 35 | 20 | 25 | 20 | Emocional sube por identidad |
| Hogar / decoración | 28 | 32 | 22 | 18 | Funcional pesa (materialidad) |
| Salud / fertilidad | 30 | 30 | 35 | 5 | Urgencia baja, social proof crítico |
| Tecnología / B2B | 15 | 50 | 30 | 5 | Funcional domina, urgencia mínima |
| Industrial / especificación (ej. eléctrico) | 20 | 45 | 30 | 5 | Sin urgencia: marcas que no hacen promos |
| Educación | 25 | 35 | 30 | 10 | Urgencia atada a fechas de inscripción |
| Servicios profesionales (clínicas) | 35 | 25 | 35 | 5 | Confianza > prisa |

### Tabla Diversity Score (formato canónico en el brief)

| Ángulo | Peso E | Peso F | Peso S | Peso U | Uso en funnel |
|--------|--------|--------|--------|--------|---------------|
| 01 · Problema/Dolor | 65% | 35% | — | — | TOFU / MOFU |
| 02 · Beneficios | — | 80% | — | 20% | MOFU |
| 03 · Social Proof | — | 10% | 85% | 5% | MOFU / BOFU |
| 04 · Urgencia | — | 15% | 10% | 75% | BOFU |
| 05 · Identidad | 90% | 5% | 5% | — | TOFU |
| 06 · Comparación | — | 70% | 30% | — | MOFU / BOFU |

Cerrar siempre con **las dos capas declaradas**:
- **Concept Diversity (Capa 1):** "8 piezas / 6 conceptos distintos — 6 ángulos, 4 personas, 2 ofertas. Eje primario: ángulo." ← esto es lo que mira Andromeda.
- **Diversity psicológico (Capa 2):** "Ratio E:F:S:U ≈ 28:30:22:20. Score: 92."

Si la Capa 1 es baja (pocos conceptos reales) el lote NO está diversificado aunque la Capa 2 dé 95. La Capa 1 manda.

---

## 8.4 — Estructura canónica del HTML de brief

El entregable es UN archivo HTML standalone, dark, sin dependencias externas más allá de Google Fonts. Las secciones aparecen siempre en este orden:

```
NAV FIJA (top)
  · Logo / nombre del cliente como texto Bebas Neue
  · Links anclados a cada sección
  · NUNCA mención de agencia en footer ni nav

01 · Contexto del cliente
  · Negocio, propuesta de valor, sitio, mercado
  · Fuentes (cuando se scrapea la web del cliente, citar URL)

02 · Concepto del lote
  · Tesis central: qué quiere lograr este pack, por qué ahora
  · 1–2 párrafos, no más

03 · Frameworks aplicados (3 cards: GEM / Andromeda / Diversity)
  · Explicación corta de cada uno
  · Sirve también de educación al cliente

04 · Andromeda · distribución funnel
  · Cards TOFU / MOFU / BOFU con qué pieza va en cada fase

05 · Ángulos creativos (el corazón del brief)
  · 5–9 conceptos numerados (01, 02, 03…)
  · Cada uno con: nombre del ángulo, formato (estática/reel/carrusel/UGC),
    fase Andromeda, eje Diversity, bloque G/E/M completo,
    descripción visual, copy primary text, headline, descripción, CTA

06 · GEM Matrix / Tabla de testing
  · Tabla con: # / Variación / Formato / Ángulo / Audience / KPI / Objetivo / Eje Diversity

07 · Diversity Score consolidado
  · Tabla de pesos por ángulo
  · Ratio final E:F:S:U
  · Score numérico

08 · Guía de tono y estilo
  · Hacer / Evitar (formato dos columnas)
  · Lenguaje, voz, qué palabras vetar, qué recursos no usar

09 · Plan de entrega
  · Cantidades, formatos, fechas, prioridad
```

---

## 8.5 — Reglas de tono y formato (siempre)

**Idioma y voz:**
- Castellano rioplatense con voseo siempre (vos / tenés / sabés / mirá)
- Una sola voz por pieza — si es UGC, lenguaje de cliente; si es marca, lenguaje de marca
- Cero "transformá tu vida", "descubrí el secreto", "imperdible", "no te lo podés perder"
- Cero emojis decorativos. Emojis solo si son funcionales (✓ checklist, → flecha)

**Visual del HTML:**
- Fondo `#0a0a0a` o `#0f0e0d`, texto `#f0ede8` o similar
- Acento dorado/cobre (`#c9a86c`, `#C8B98A`, `#e8d5b0`) para títulos y números de sección
- Tipografía: Bebas Neue para títulos grandes, Barlow Condensed o Inter para body
- Layout: max-width 1100–1200px, secciones separadas por `border-bottom: 1px solid #1a1a1a`, padding generoso (`5rem 0`)
- Nav fija con `backdrop-filter: blur(8px)` y `rgba(10,10,10,0.95)`
- Labels de sección en mayúsculas, letter-spacing alto, color dorado tenue
- Números de sección grandes (Bebas Neue, dorado) como ancla visual
- Tablas con `border-collapse: collapse`, headers en mayúsculas, badges de colores por eje (E dorado, F azul, S verde, U rojo)

**Lo que NO va nunca:**
- Mención de la agencia que produjo el brief en el documento entregable
- Watermarks, firmas, "powered by"
- Disclaimers tipo "esto es una propuesta sujeta a cambios"
- Emojis de fuego, money bag, ojos, sirena, megáfono
- Countdown chino, "mega oferta", "imperdible", "última oportunidad" si no es real
- Fotos de stock obvio en mockups (mejor describir visualmente que mostrar stock genérico)

---

## 8.6 — Decisiones que dependen del cliente

Antes de armar el brief, definir (preguntar al usuario una sola vez si no está claro):

1. **Tipo de pack:** ¿solo estáticas? ¿solo reels? ¿mix? ¿incluye UGC con creators?
2. **Objetivo de campaña:** ¿branding / awareness / conversión / catálogo / leads?
3. **Hero del lote:** ¿hay un producto/oferta protagónica o es genérico?
4. **Restricciones de marca:** ¿la marca hace ofertas? ¿usa urgencia? ¿permite humor?
5. **Diferencial real:** qué dice la web del cliente (scrapear si hace falta) y qué dicen los reviews — eso alimenta el eje Funcional y Social Proof con lenguaje real.

Si la marca no hace promos (caso eléctrico/industrial/lujo), el eje Urgencia se baja a 5–10% y se reemplaza por Social Proof o Funcional. Forzar urgencia donde no corresponde rompe el brief.

---

## 8.7 — Checklist final antes de entregar

**Concepto y diversidad (lo que mira Andromeda):**
- [ ] Cada concepto difiere de los demás en **ángulo, oferta o persona** — nunca solo en formato ni solo en eje psicológico
- [ ] **Eje primario de variación del lote = ángulo** (idealmente un ángulo único por concepto)
- [ ] Personas definidas por **problema/deseo/trigger**, no por demografía amplia
- [ ] Ningún par de conceptos comparte persona + ángulo + oferta (si lo comparten, son uno solo → rediferenciar)
- [ ] La tabla de testing mapea **1 concepto → 1 ad set**
- [ ] **Concept Diversity declarado** (N conceptos distintos / M piezas, con ángulos/personas/ofertas)

**Estructura de pieza y framework:**
- [ ] Cada concepto tiene G/E/M explícitos
- [ ] El Gancho (G) pasa el grading mínimo (claridad + 2 de: relevancia de problema, novedad, especificidad, credibilidad) — ver 9.3
- [ ] Sin persona call-out genérico como hook ("si sos X, escuchá") — se agita el problema
- [ ] El producto se introduce lo más tarde posible; bridges hook→body y body→CTA cuidados
- [ ] Cada concepto tiene fase Andromeda asignada (TOFU/MOFU/BOFU)
- [ ] Cada concepto tiene eje Diversity psicológico dominante (E/F/S/U)
- [ ] El lote cubre las 3 fases del funnel (mínimo una pieza por fase)

**Dimensionamiento y cierre:**
- [ ] Cantidad de piezas dimensionada por spend (regla 1 creativo / $1.000 de spend mensual, o modelo EV — ver 9.5)
- [ ] Ratio E:F:S:U calculado y declarado al final (Capa 2)
- [ ] Ningún eje psicológico supera 40% del total (salvo que el vertical lo justifique)
- [ ] Copy en rioplatense con voseo, sin emojis decorativos, sin clichés AI
- [ ] Creators/voces nativos del mercado target (AR ≠ ES ≠ Miami) — ver 9.7
- [ ] HTML dark, Bebas Neue + Barlow Condensed/Inter, nav fija, sin mención de agencia
- [ ] Tono coherente con la marca real (scrapeada o referida por el usuario)
- [ ] Plan de entrega con cantidades y prioridad al final

---

# PART 9: RECALIBRACIÓN ANDROMEDA 2026 (inteligencia de campo)

Esta parte es el fundamento de la recalibración del Diversity Score (8.3) y la capa estratégica que envuelve todo el framework GEM. Destila cómo funciona hoy el sistema de Meta y cómo eso cambia la forma de armar lotes, ganchos, testing y volumen. Cuando haya conflicto entre una regla vieja y esta parte, manda esta parte.

## 9.1 — Cómo funciona Andromeda de verdad (y qué implica)

Andromeda es el sistema de retrieval/ranking de Meta. La mecánica que importa:

- **El creativo ES el targeting.** No elegís audiencia: Meta lee la transcripción, el copy y el visual de cada pieza e infiere a quién servírsela. La audiencia se "escribe" dentro del creativo. Targeting por intereses está muerto hace rato.
- **Creative similarity score + bundling.** Si metés piezas parecidas (mismo shoot, misma persona, mismo ángulo en otro formato), Meta las agrupa y las sirve a la misma gente. Resultado: frecuencia ↑, reach ↓, ROAS ↓ (rendimientos decrecientes).
- **Implicancia 1 — diversidad de CONCEPTO, no de formato.** Es la base de la Capa 1 del Diversity Score (8.3). Variar formato/trigger sin variar ángulo/persona/oferta no rompe el bundling.
- **Implicancia 2 — un concepto por ad set.** El targeting vive a nivel ad set. Mezclar conceptos confunde a Meta y borra el aprendizaje (no sabés qué funcionó).
- **Implicancia 3 — sequencing.** Meta no optimiza por last-click: optimiza por la secuencia de impresiones que termina en compra. Un ad TOFU con ROAS propio bajo (ej. 1.4x) puede ser el que abre la conversión que otro ad cierra. Por eso **no se apaga un ad dentro de un ad set que está cumpliendo KPI**, aunque su ROAS individual se vea feo.
- **Implicancia 4 — el call-out entrena el targeting.** Si el hook dice "dueños de e-commerce que facturan +5M", Meta sale a buscar esa audiencia. Hook genérico ("hola a todos") = Meta confundido, reparte mal.

## 9.2 — Orden de prioridad de testeo (recalibrado)

Casi todos lo hacen al revés (testean formatos). El orden correcto, de mayor a menor leverage:

| # | Variable | Cuándo tocarla |
|---|----------|----------------|
| **1** | **Ángulo** | Lo primero que rotás cuando algo no rinde. Es donde está casi todo el leverage. |
| **2** | **Oferta** | Producto + framing de valor (bundles, regalo, suscripción). Importantísimo pero con techo bajo (1–2 productos = pocas variantes). |
| **3** | **Persona** | Si ya validaste que esa persona compra, el problema casi nunca es la persona — es el ángulo. |
| **4** | **Formato** | Lo último. Da algo de reach nuevo, no diversifica de verdad. |

Esto reordena la GEM Matrix / tabla de testing: el **eje primario de la tabla es el ángulo**, no el formato.

## 9.3 — Gancho (G) recalibrado: 3 capas + grading

El Gancho del bloque GEM se descompone en **3 capas testeables por separado**: **visual** (lo que se ve), **audio** (lo que se escucha) y **copy/overlay** (texto sobre la pieza + primary text). El 80% de la gente no pasa los primeros segundos: el hook decide casi todo.

**Grading del hook** (no necesitás 10/10 en todo; alcanza con claridad + 2 fuertes):

| Criterio | Pregunta |
|----------|----------|
| Claridad | ¿Un desconocido entiende de qué va en 3 segundos? |
| Relevancia | ¿Agita un problema real? (el problema rinde más que el call-out de persona) |
| Novedad | ¿Genera white space / blue ocean o ya se vio mil veces? |
| Especificidad | ¿Hay números, nombres, outcomes concretos? |
| Credibilidad | ¿El visual aporta autoridad contextual (la persona correcta para el tema)? |

**Persona call-outs sobrevalorados.** "Si sos mamá de 30–35, escuchá" rinde menos que agitar el problema directo: nadie quiere que lo etiqueten, pero todos quieren que les nombren su dolor.

**Tipos de hook para rotar:** agitación de problema · verdad contraintuitiva ("todo lo que te dijeron sobre X está mal") · prueba específica ("bajé 12 kilos en 90 días sin dejar la pasta") · curiosity gap · confrontación de precio ("esto cuesta $120 y es lo más vendido, te explico por qué") · confrontación psicológica · ASMR/sensorial (brutal en fashion) · carta del fundador con stakes reales.

**Rotar hooks es casi gratis y de altísimo leverage:** mismo body, muchos hooks. Revive winners fatigados y arregla ads muertos por mal hook rate.

**Bridges (transiciones).** Los dos puntos que más se rompen: hook→body y body→CTA. No introducir el producto demasiado pronto: meterlo lo más tarde posible, cuando la persona ya está solution-aware y pre-vendida. Introducir el producto apenas termina el hook mata la pieza aunque el resto esté perfecto.

## 9.4 — Lectura de métricas (recalibrado)

Orden de fiabilidad para juzgar un creativo:

1. **Amount spent (el mejor proxy).** Por el sequencing, Meta manda plata al ad que realmente mueve la aguja aunque su ROAS propio sea bajo. Si un ad tiene el doble de spend que los otros, suele ser el mejor TOFU.
2. **ROAS a nivel ad set / campaña** — NO a nivel ad (a nivel ad es ruido por last-click). Siempre 7-day click y **excluyendo clientes existentes**.
3. CTR / CPC — indicadores de borde (un CPC carísimo crónico = ese ad nunca va a ser rentable).
4. **Hook rate / hold rate** — solo diagnóstico (no correlacionan con conversión). Hook rate = % que pasa los 3s; hold rate = % que pasa los ~15s. Sirven para saber si arreglar el hook o el bridge.

**Banderas rojas y reglas:**
- **Frecuencia en cold > 2** = fatiga o falta de diversidad. En cuentas sanas cold casi nunca pasa de 2.
- **No tocar ad sets que cumplen KPI** (resetea learning phase / rompe sequencing).
- **DPA**: sobreestima ROAS. Mirar atribución incremental y excluir clientes existentes antes de creer el número. No escala bien en frío.

## 9.5 — Volumen y modelo financiero del lote

**Para dimensionar cuántas piezas lleva un lote (úsalo al cotizar y al armar el plan de entrega):**

- **Regla simple:** 1 creativo nuevo por cada **$1.000 de spend mensual**. Cliente que invierte $30.000/mes → 30 piezas nuevas/mes.
- **Versión fina (EV):** spend promedio por ad × ROAS (7-day click) = valor esperado por ad. Dividís el target de facturación de nuevos clientes por ese EV = cantidad de creativos necesarios. Ej.: $1.000 spend medio × 3 ROAS = $3.000 esperados por ad.
- **Hit rate ~5%:** para validar un concepto nuevo hacen falta ~10–20 piezas, no 2–3. Una pieza por concepto no es un test.

**Presupuesto de producción (argumento de venta — la mayoría subinvierte):**

| Nivel de spend | Producción |
|----------------|-----------|
| $4–30K/mes | Founder-led, iPhone, natural. El costo es tiempo, no plata. 3 conceptos core. |
| $30–100K/mes | **25% del media budget** a producción. 5–6 conceptos. Sumar partnership ads. |
| $100K+/mes | **~10% del media budget** (≈2.5% del revenue). Equipo completo, 8–10 conceptos activos. |

**Reparto del esfuerzo de producción:** 50–60% replicar/iterar winners · 20–30% iterar under-performers (cambio de hook/formato) · 20–30% conceptos nuevos. Casi todos sobre-ponderan lo nuevo; la plata está en replicar lo que ya ganó.

## 9.6 — Fatiga y rotación

Todo creativo fatiga. Dos causas: (1) similitud — mismo concepto/audiencia que el resto; (2) audiencia muy chica — llega a su techo de spend. Cada ad tiene un **maximum spend threshold**: el área bajo su curva de spend es su capacidad total. Podés exprimirlo rápido (fatiga rápido) o mantenerlo bajo (dura meses) según inventario y cash conversion del cliente.

**Tácticas de rescate (de mayor a menor):** rotar hooks (la #1) · pasar a cost cap · post ID a scaling campaign · rotar formato. Ninguna salva un lote sin diversidad de concepto — por eso el portfolio se gestiona antes, no después.

**Trial reels como test gratis:** subir el creativo como trial reel con el CTA cortado → Meta devuelve retention graph. Ves si falla el hook, el bridge o el body **antes** de gastar un peso en el ad manager. Ideal para filtrar 20 hooks y subir solo los 5 que aguantan.

## 9.7 — Localización por mercado

Creators/voces **nativos del mercado target**. Mismo script, creator local. Un acento argentino no rinde en España ni en Miami. AR↔UY traslada decente; AR→US/ES no. Aplica directo a la cartera (Argentina, Chile, España, Miami): castear local por mercado, no reciclar la misma voz.

## 9.8 — IA en el pipeline: dónde sí y dónde no

- **Ideación de conceptos: NO automatizar.** Los LLMs outputean la media; no te diferencian de la competencia por más contexto/skills que les cargues. La ideación la valida el estratega humano.
- **Briefing y scripting: SÍ — es el uso central de este skill.** Cuestionario guiado (persona, concepto, oferta, formato, stage of awareness) → script/brief 99% listo. Acá es donde la IA rinde.
- **Producción:** mucho leverage (estáticas, VSLs, edición asistida).
- **Análisis de decisiones core: con cuidado.** La IA no pondera bien la jerarquía de métricas (9.4) ni el contexto comercial (inventario, cash, P&L vs balance). Úsese de apoyo, no para decidir.

## 9.9 — Recordatorios de estrategia

- **No confundir actividad con estrategia.** 2.000 ads/mes malos no escalan nada. Volumen *sobre un mínimo de calidad*, con concepto detrás.
- **Nadie predice winners.** Ni los mejores estrategas aciertan qué pieza va a ganar. El juego es: definir el piso de calidad ("¿esto es un 7/10?") y maximizar volumen sobre ese piso.
- **Pain > desire.** Los mejores assets de performance se paran sobre el dolor. Apuntar a un mix ~60/40 (hasta 70/30) hacia pain vs deseo/branding.
- **El creativo es profit center, no costo.** Meta solo distribuye; el creativo genera el revenue. Mover budget de spend a producción suele expandir facturación a spend constante.
