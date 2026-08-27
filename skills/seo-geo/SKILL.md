---
name: seo-geo
description: GEO (Generative Engine Optimization) strategy — optimizing brand presence in AI-generated responses (ChatGPT, Perplexity, Gemini, Claude, Copilot) plus traditional SEO foundations. Use when working on the GEO tool, geo-monitoring-service, LLM traffic detection, brand presence monitoring, or geo strategy AI endpoints.
---

# SEO + GEO Optimization Expert

This skill covers both traditional SEO and **GEO (Generative Engine Optimization)** — the practice of ensuring a brand appears in AI-generated answers.

> **Core insight:** AI search engines don't rank pages — they *cite* sources. Being cited is the new ranking #1.

---

## Part 1 — GEO (Generative Engine Optimization)

### What GEO Is

When users ask ChatGPT "¿Cuál es la mejor clínica estética en Buenos Aires?" or Gemini "recomendar ropa femenina argentina", the LLM generates an answer citing sources it was trained on or retrieved. **GEO is about becoming one of those cited sources.**

### Princeton-Backed GEO Methods (by visibility boost)

| Method | Visibility Boost | How to Apply |
|---|---|---|
| Citation addition | +40% | Add references to external studies, official sources, industry reports |
| Statistics inclusion | +37% | Include specific numbers, percentages, conversion rates, market data |
| Expert quotations | +30% | Quote founders, specialists, or credible voices (even brand-internal) |
| Authoritative tone | +25% | Use confident, declarative language — avoid hedging ("podría ser", "tal vez") |
| Simplified explanations | +20% | Clear definitions, jargon-free, FAQ format |
| Technical terminology | +18% | Use precise industry terms (signals expertise to LLM) |
| Vocabulary diversity | +15% | Avoid word repetition, use synonyms and related concepts |
| Enhanced fluency | +15-30% | Well-structured prose, no run-ons, logical flow |

### Anti-patterns (Princeton 2024 — what HURTS AI visibility)

| Anti-pattern | Visibility impact | Why |
|---|---|---|
| Keyword stuffing | **−10%** | LLMs detect unnatural density; downranks for retrieval |
| Generic claims without sources | −5 to −10% | Treated as low-confidence; not extracted as citation |
| Promotional / brand-superlative language | −5% | Triggers ad-like filters in citation selection |
| Hedging language ("podría", "tal vez", "quizás") | −5% | Reduces authoritative score |
| Stale content (>90 days, evergreen topics) | −5 to −15% | Freshness signal weakens retrieval ranking |

> **Source:** Princeton KDD 2024 GEO research — measured % shift in citation rate when each pattern is added/removed from a corpus, holding everything else constant.

### Per-LLM Optimization Tactics

**ChatGPT (most important for purchase recommendations)**
- Domain authority is critical — backlinks from recognized sites
- Content freshness: update pages every ≤30 days for active indexing
- Structured data (JSON-LD) with Organization + Product schema
- Strong brand entity consistency across the web

**Perplexity (citations-first engine)**
- Allowlist `PerplexityBot` in robots.txt (many sites accidentally block it)
- FAQ schemas — Perplexity favors structured Q&A content
- Host PDF resources (guides, white papers) — Perplexity cites PDFs heavily
- Clear `<h1>` / `<h2>` hierarchy for content extraction

**Google SGE / Gemini**
- E-E-A-T signals: Experience, Expertise, Authoritativeness, Trustworthiness
- Topical authority clusters: cover a topic deeply across multiple interconnected pages
- First-person experience signals (original data, case studies, own photos)

**Microsoft Copilot / Bing**
- Submit to Bing Webmaster Tools and verify indexing
- Microsoft ecosystem integration (LinkedIn presence helps)
- Structured data per Bing's guidelines

**Claude (Anthropic)**
- Brave Search indexing (Claude uses Brave for search)
- High factual density: specific numbers, dates, locations
- Clear entity disambiguation: brand name + category + location in each page

### Bot Access Verification

Ensure these bots are NOT blocked in `robots.txt`:
```
Googlebot, Bingbot, PerplexityBot, ChatGPT-User, ClaudeBot, GPTBot
```

**Bots de entrenamiento vs. bots de indexación/búsqueda** — bloquear no tiene el mismo efecto:
- **Entrenamiento** (GPTBot, ClaudeBot, Google-Extended): bloquearlos no saca al sitio de las respuestas ya generadas, solo evita que futuro contenido entrene al modelo.
- **Indexación/búsqueda** (OAI-SearchBot, Claude-SearchBot, PerplexityBot): bloquearlos SÍ saca al sitio de esas respuestas — son los que importan para GEO.
- **Google-Agent, Google-NotebookLM, Google Messages** son *user-triggered* (el usuario les pide que visiten una URL puntual) y **no se pueden bloquear por robots.txt** — si hace falta restringirlos, es control de acceso server-side.

### GEO Content Structure

Content that gets cited by LLMs shares these traits:
- **Answer-first format**: Lead with the direct answer, then explain
- **Clear H1–H3 hierarchy**: LLMs extract by heading structure
- **Bullet points and comparison tables**: Easier to parse and cite
- **Short paragraphs** (2-3 sentences max): Reduces extraction noise
- **FAQ sections**: "¿Cuánto cuesta X?", "¿Cuál es la diferencia entre X e Y?" — LLMs love Q&A format
- **Data and specifics**: "47% de nuestros clientes..." beats "muchos clientes..."

### LLM Traffic Detection (Worker Brain Implementation)

Worker Brain detects LLM-referred traffic via GA4 `trafficSources` already stored in `channel_snapshots`. The `geo-llm-traffic.ts` utility filters by known LLM domains:

```typescript
const LLM_SOURCES = [
  { id: 'chatgpt',    domains: ['chatgpt.com', 'chat.openai.com'] },
  { id: 'perplexity', domains: ['perplexity.ai'] },
  { id: 'gemini',     domains: ['gemini.google.com', 'bard.google.com'] },
  { id: 'copilot',    domains: ['copilot.microsoft.com', 'bing.com'] },
  { id: 'claude',     domains: ['claude.ai'] },
  { id: 'you',        domains: ['you.com'] },
];
```

GA4 reports `sessionSource` dimension (e.g., `"chatgpt.com"`). Matching is against `trafficSource.source`. Copilot/Bing may report as `"bing"` or `"copilot.microsoft.com"` — both variants included.

### Brand Presence Monitoring

Weekly cron (`geo-monitoring`) queries each configured LLM with auto-generated questions:
- `"¿Cuál es la mejor [category] en [location]?"`
- `"¿Dónde comprar [category] online en [location]?"`
- `"Recomendar [category] para [target audience]"`
- Plus custom queries from `geoMonitoringConfig.customQueries`

Results stored in `geo_monitoring_runs` Firestore collection. Brand detection is case-insensitive, checks brand name + domain + product names from `brandProfile`.

### GEO Strategy Output Format

When generating GEO strategy recommendations, organize by effort tier:
- **Quick wins** (1-2 semanas): title tags, FAQ sections, statistics in existing content, bot allowlist
- **Medio plazo** (1-3 meses): new content types (comparativas, "mejor X en Y"), structured data, backlink outreach
- **Largo plazo** (3-6+ meses): topical authority cluster, original research/data, brand entity building

---

## Part 2 — Traditional SEO Foundations

### Five-Priority Audit Framework

1. **Crawlability & Indexation** — robots.txt, sitemap, canonical tags, redirect chains, soft 404s
2. **Technical Foundations** — Core Web Vitals (LCP <2.5s, INP <200ms, CLS <0.1), HTTPS, mobile
3. **On-Page Optimization** — Title tags (50-60 chars), meta descriptions (150-160 chars), H1 hierarchy, keyword alignment
4. **Content Quality (E-E-A-T)** — Experience, Expertise, Authoritativeness, Trustworthiness
5. **Authority Signals** — Backlinks, brand mentions, internal linking architecture

### Schema Markup Priority

For ecommerce clients, implement in this order:
1. `Organization` — brand entity (critical for LLM citation)
2. `Product` + `Offer` — product pages
3. `Article` — blog/content pages
4. `BreadcrumbList` — navigation context

**`FAQPage` ya NO da rich results en Google para ningún sitio** (retirado globalmente el 7-may-2026, ya no es solo restricción a gobierno/salud). Seguí usando FAQ en la página si ayuda al lector o a otros motores (Perplexity sí las favorece), pero no la vendas como mejora de ranking en Google ni la puntúes como ganancia de schema.

**`llms.txt` no es palanca de ranking para Google Search** (confirmado oficialmente 2026-06-29). Tenerlo solo se justifica para otros crawlers de IA — nunca ofrecerlo a un cliente como trabajo de visibilidad en Google.

### Chequeo de página vs SERP (SXO)

Antes de recomendar contenido nuevo, comparar el tipo de página del cliente contra el tipo de página que realmente domina el SERP para esa keyword (guía vs. producto vs. comparativa vs. landing). Una página bien optimizada en on-page puede no rankear simplemente porque es el tipo de página equivocado para esa intención de búsqueda — chequeo gratis vía WebSearch antes de invertir en reescribir.

### Issue Reporting Format

Always use: **Issue → Impact → Evidence → Fix → Priority**

---

## Integration with Worker Brain

The GEO tool (`/geo`) reads from:
- `channel_snapshots` with `channel: 'GA4'` → `rawData.trafficSources` for LLM traffic detection
- `geo_monitoring_runs` Firestore collection → brand presence results
- `channel_snapshots` with `channel: 'GSC'` → top pages to analyze for GEO content opportunities

The AI endpoint (`/api/geo/strategy`) uses Claude `claude-sonnet-4-6` with:
- Last 4 `geo_monitoring_runs`
- Client `brandProfile`
- Top GSC pages (what's already ranking)
- LLM traffic data (which LLMs are already sending traffic)