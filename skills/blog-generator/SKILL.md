---
name: blog-generator
version: 1.0.0
description: |
  Worker Brain Blog Generator tool — per-client SEO+GEO article production with
  opportunity-driven topic suggestions, 3-month editorial calendar, deterministic
  0-100 analyzer, and direct WordPress publish. Use when working with /tools/blog-generator,
  /admin/blog-briefs/[clientId], /admin/blog-wordpress/[clientId], /tools/blog-generator/calendar,
  /tools/blog-generator/performance, or any blog_* Firestore collection. Also use for
  any blog/SEO/GEO content tasks for Worker Brain clients.
---

# Blog Generator — Worker Brain Tool

## Qué es

Tool integrado en Worker Brain (`/tools/blog-generator`) que produce artículos blog SEO + GEO-optimizados para cualquier cliente. Usa un **brief por cliente** (Firestore `blog_briefs/{clientId}`) como system prompt + Claude Sonnet 4.5 para generación + analyzer determinista 0-100.

**Diferencial vs ChatGPT/Claude web:** contexto del cliente persistente + reglas anti-AI-slop + data real de GSC/Ads/GA4 → artículos que rankean en Google Y se citan en ChatGPT/Perplexity.

## Niveles shipped

| Nivel | Status | Features |
|---|---|---|
| **A** | ✅ Shipped 2026-04-14 | Brief per cliente, generator con prompt caching, analyzer 5-categorías, export Gutenberg + Yoast, drafts en Firestore |
| **B** | ✅ Shipped 2026-04-15 | Panel Oportunidades (GSC striking-distance + Ads high-CPC + GA4 high-bounce), prefill al form, cache 24h |
| **C-1** | ✅ Shipped 2026-04-15 | Editorial calendar auto (3 meses, cluster rotation, timing windows) |
| **C-3** | ✅ Shipped 2026-04-15 | WordPress publish REST API (Application Password auth, media upload, Yoast/RankMath meta) |
| **C-4** | ✅ Shipped 2026-04-15 | Performance tracking (GSC + GA4 por artículo, cron semanal, dashboard) |
| **C-2** | ⚠️ Scaffold only | Cron pre-gen disponible en `/api/cron/blog-pregenerate`, OFF por default hasta activar GitHub Actions |
| **C-5** | ❌ Roadmap | Self-evolving brief (brief evoluciona según performance) |
| **C-6** | ❌ Roadmap | Multi-client ops dashboard |

Docs: `docs/blog-generator-README.md`, `docs/blog-generator-nivel-{b,c}-roadmap.md`.

## Arquitectura

### Firestore collections

| Collection | Doc ID | Propósito |
|---|---|---|
| `blog_briefs` | `{clientId}` | Brief versionado: brand, clusters, author personas, source hierarchy, banned phrases, differentiators, linkable assets |
| `blog_articles` | auto | Drafts + versiones + scores + generationCost + performance + wordpressPostId |
| `blog_opportunities` | `{clientId}__YYYY-MM-DD` | Cache 24h de suggestions desde GSC/Ads/GA4 |
| `blog_calendars` | `{clientId}` | Plan de 3 meses con slots {planned, generated, qa_approved, published, skipped} |
| `blog_wordpress_configs` | `{clientId}` | Credenciales App Password (REDACTED on GET, nunca exposed client-side) |

**Index nuevo** (desplegado): `blog_articles: (clientId ASC, updatedAt DESC)`. Los demás queries usan indexes existentes de `channel_snapshots` o son doc-ID / single-field.

### Module boundaries

```
src/types/blog.ts              → BlogBrief, BlogArticle, BlogCalendar, BlogOpportunity, WordpressConfig, BlogArticlePerformance
src/lib/blog/prompts.ts        → system prompt builder (cache_control: ephemeral)
src/lib/blog/generator.ts      → Sonnet 4.5 call + JSON parse + cost tracking
src/lib/blog/analyzer.ts       → 20+ checks deterministas, 5 categorías (100pts)
src/lib/blog/brief-service.ts  → CRUD + default template
src/lib/blog/opportunities.ts  → GSC/Ads/GA4 signals → ranked suggestions + Haiku batch titles
src/lib/blog/calendar.ts       → auto-generate 3-month plan + slot updates
src/lib/blog/wordpress.ts      → REST API publish, media upload, sanitized HTML
src/lib/blog/performance.ts    → aggregate GSC+GA4 per article URL
```

### Reglas de diseño (no romper)

1. **Brief es system prompt cacheable** — el BRIEF es inmutable por cliente, va marcado con `cache_control: { type: 'ephemeral' }`. Eso reduce costo ~90% en reruns dentro de 5 min. NO meter user-specific data (topic, keyword) en el system — va en el user message.
2. **Analyzer es determinista** — cero LLM calls. Todo regex, keyword matching, Flesch. Es gratis y permite re-analyze instantáneo post-edición.
3. **WP config separado del brief** — Firestore collection aparte (`blog_wordpress_configs`) porque contiene app password. GET retorna `appPassword: '••••'` siempre. Nunca exponer al cliente.
4. **Safety rail publish** — `/api/tools/blog-generator/publish-wp` rechaza `status=publish` si score < 70. Fuerza a pushear como draft primero. Para auto-publish (Phase 2) el threshold configurable sube a min 70 duro.
5. **Credenciales a través del server SIEMPRE** — ninguna llamada WP desde client-side. Mismo patrón que Klaviyo/Meta API.
6. **Queries por cluster** — siempre validar que el cluster existe en `brief.clusters[]` antes de generar. Si no matchea, 400 con lista disponible.

## Pipeline completo end-to-end

```
1. Opportunities (Panel UI calls GET /opportunities)
     ↓ reads GSC+Ads+GA4 channel_snapshots 14d
     ↓ scores candidates (striking distance, CPC, bounce)
     ↓ assigns cluster via Jaccard overlap
     ↓ batch Haiku call for titles
     ↓ returns BlogOpportunity[10]
     ↓ cached 24h
2. Operator picks → form prefills
3. Generate (POST /generate)
     ↓ loads brief → system prompt (cached)
     ↓ user message with topic/keyword/notes
     ↓ Sonnet 4.5 returns JSON {frontmatter, content, differentiators_used, notes}
     ↓ normalizeMeta() validates shape
     ↓ analyzer scores 0-100
     ↓ saves blog_articles with generationCost
4. Review + edit in UI
     ↓ optional Re-analyze (free, deterministic)
5. Export
     ↓ Yoast copy fields (title, desc, slug, canonical, OG)
     ↓ Gutenberg HTML
     ↓ Markdown download
     ↓ Publish to WordPress (draft or publish w/ score gate)
6. Performance (cron Monday 09:00 UTC, suggested)
     ↓ iterates published articles
     ↓ aggregates GSC+GA4 for article URL last 28d
     ↓ updates blog_articles.performance
7. Dashboard surfaces data for strategy evolution
```

## API routes (all under /api/tools/blog-generator/ except crons)

| Method | Path | Purpose |
|---|---|---|
| POST | `/generate` | Generate new article + score + save |
| POST | `/analyze` | Re-score article (free, no LLM) |
| GET | `/articles?clientId=X` | List drafts |
| GET/PATCH | `/articles/[id]` | Get/update single article (status, content, meta) |
| GET/PUT/DELETE | `/briefs/[clientId]` | Brief CRUD (default template if missing) |
| POST | `/seed/latitravel` | One-click seed Lati Travel brief v2.1 |
| GET | `/opportunities?clientId=X&refresh=1` | Ranked opportunities (24h cache, refresh=1 to force) |
| GET/POST/PATCH | `/calendar/[clientId]` | Get / auto-generate / patch single slot |
| GET/PUT/DELETE | `/wordpress/[clientId]` | WP config (appPassword redacted on GET) |
| POST | `/wordpress/[clientId]/test` | Test WP connection (fetches /wp/v2/users/me) |
| POST | `/publish-wp` | Publish article to WP with safety rail |

Cron routes (bearer auth via `CRON_SECRET`):
- `/api/cron/blog-performance` — Monday 09:00 UTC (suggested) — free
- `/api/cron/blog-pregenerate` — scaffold only, NOT scheduled yet

## Cost model

| Operation | Model | Cost |
|---|---|---|
| Generate new article | Sonnet 4.5 | ~$0.08 first / $0.04 cached (prompt caching) |
| Analyze / re-analyze | none (deterministic) | $0 |
| Opportunities refresh | Haiku 4.5 (batch titles) | ~$0.005 |
| Performance cron | none (aggregates channel_snapshots) | $0 |
| Editorial calendar auto-gen | Haiku via opportunities | ~$0.005 |
| WordPress publish | none (REST API) | $0 |

Monthly for Lati (6 articles + weekly opps + weekly perf + monthly calendar): **~$0.30/month API**.
10 clients scaling: **~$3-5/month API total**.

Track cost per article in `blog_articles.generationCost`.

## BRIEF structure (core)

```typescript
{
  clientId, clientName, version,
  brand: { name, site, blogHome, businessType, usp, markets[], audience, tone },
  offerings: [{ label, price }],
  contentRules: string[],        // numbered content rules (length, keyword placement, CTA)
  bannedPhrases: string[],       // anti-AI vocabulary
  typographyRules: { noEmDashes, noDoubleHyphens, straightQuotesOnly },
  readabilityFloor: { generalTarget: {min, max}, medicalMinimum },
  clusters: [{ name, pillarUrl, pillarKeyword, timingNotes }],
  authorPersonas: [{ clusterName, name, role, bio }],
  sourceHierarchy: [{ tier, label, sources[] }],
  forbiddenSources: string[],
  differentiators: { requireAtLeast, items[] },
  linkableAssets: [{ title, url, anchorContext, clusterName? }],
  imageSourcing: { defaultStock, allowAiGenerated, preferOwnPhotos, densityPer400Words },
  slug: { includeDate, prefix? },
  frontmatterFields: string[],
  strategyDocUrl?: string,
}
```

## Analyzer breakdown (100 pts)

| Category | Max | Checks |
|---|---|---|
| Content Quality | 30 | Word count ≥1000 (10), no paragraph >150w (5), Flesch meets floor (8), 0 banned phrases/structural AI patterns (7) |
| SEO Optimization | 25 | KW in H1 (4), KW in first para (3), KW in ≥2 subheadings (4), meta title 55-60c (3), meta desc 150-160c (3), pillar link (4), extra internal link (4) |
| E-E-A-T | 15 | Author byline+bio+role (6), authoritative citations ≥2 (5), no forbidden sources (4) |
| Technical | 15 | All frontmatter fields (5), OG+Twitter tags (3), no em-dashes/double-hyphens (3), slug format (2), image density (2) |
| AI Citation Readiness | 15 | FAQ or ≥3 question headings (5), answer-first intro 30-90w (3), Key Takeaways block (3), stats with cited sources ≥3 (4) |

**Brief compliance** reported separately (X/Y checks passed) — tracks MANDATORY rules specifically. Incluye 2 checks informativos que NO suman al puntaje de 100: `cta-placement` (CTA único, al final) y `keyword-cannibalization` (¿otro artículo del cliente ya targetea esta keyword?).

## Lati Travel seed — reference

BRIEF v2.1 seeded via `POST /api/tools/blog-generator/seed/latitravel`:
- 5 clusters: Buenos Aires, Patagonia, Cusco/Machu Picchu, Lima, Salta+Jujuy
- 5 author personas (Sofia, Martin, Carla, Diego, Valeria) — one per cluster
- 6 linkable assets (existing lati blog posts at latitravel.com root, no /blog/ prefix)
- 4-tier sources: PROMPERU/CDC/PeruRail/Lati internal
- 4 differentiators with requireAtLeast=2: 2026 rule, official stat, budget table, anecdote
- 9 banned phrases, no em-dashes, no double-hyphens

Use as template when adding new clients — most fields transfer with brand-specific substitutions.

## Common operator flows

### Flow A — Pick from opportunities

1. Open `/tools/blog-generator`, select client
2. Opportunities panel loads top 10 (cache 24h)
3. Click "Use →" → form prefills (topic, keyword, cluster, notes)
4. Generate → review → export → publish

### Flow B — Planned article from calendar

1. Open `/tools/blog-generator/calendar?clientId=X`
2. Click "Auto-generate 3-month plan" (first time) or manually add slots
3. Click "Generate" on any planned slot → article in qa
4. Back to generator → open draft from "Recent drafts" → review → publish

### Flow C — Manual topic

1. Open `/tools/blog-generator`, fill form manually
2. Ignore opportunities panel
3. Generate → review → export

### Flow D — Optimize existing blog

1. Opportunities panel surfaces candidates with "REWRITE" badge (from GA4 high-bounce signal)
2. Click "Use →" → notes auto-set with existing URL
3. Generate → keep slug identical to replace the old post

## Quality hardening (2026-04-15)

Guards against common failure modes observed in early runs:

1. **Auto-fix loop in generator** — `src/lib/blog/generator.ts` runs `criticalFails()` on first-pass output. If meta title length/keyword, meta desc length/keyword, keyword in first 80 words, keyword in ≥2 subheadings, em-dashes/double-hyphens, FAQ, or Key Takeaways are missing → re-prompts Claude ONCE with specific errors + previous draft. Max 1 retry (~$0.08 → ~$0.12 worst case).
2. **Typography sanitizer** — `sanitizeTypography()` runs after every generation/retry. Replaces `—` and `--` with `, `. Straightens curly quotes. Output is clean even if model ignores the rule.
3. **Prompt hardening** — `HARD RULES [re-asserted]` block at END of system prompt restates the 9 most-violated rules, followed by a 9-item self-check. Reordering to the tail solves the "model forgets early rules" problem.
4. **`brief.forbiddenHeadTerms[]`** — new BRIEF field listing generic head terms the client should NOT target (Lati: "Cusco travel guide", "Machu Picchu tour", "Argentina tours", etc). UI warns operator in yellow when primary keyword matches. Also used by `/suggest-keywords` endpoint.
5. **`/suggest-keywords` endpoint** — POST `{ clientId, topic, cluster, targetMarket }` returns 5 long-tail candidates via Haiku (~$0.003). UI has "Suggest from topic →" button; operator fills topic → click → pick from 5 → form prefills.
6. **Keyword quality warning** — UI flags if primary keyword < 3 words OR matches a forbiddenHeadTerm from the brief.

If quality regresses: check `brief.forbiddenHeadTerms` + `brief.marketKeywords`, confirm `src/lib/blog/prompts.ts` hasn't drifted, and verify operator used the Suggest button instead of typing a generic head term.

## Checks sumados al analyzer (2026-08-24, minados de claude-blog)

Implementados en `src/lib/blog/analyzer.ts`. Cambia el scoring de artículos generados de acá en adelante (no reanaliza retroactivamente lo ya guardado salvo re-analyze manual):

1. **Léxico de banned-phrases ampliado** — `defaultBriefTemplate()` en `brief-service.ts` suma "multifaceted, testament to, pivotal, cutting-edge, leverage, comprehensive, landscape of, crucial, foster, paramount, meticulous, realm of, furthermore, moreover, utilize" al default. Solo afecta briefs NUEVOS; los clientes existentes mantienen su lista tal cual la cargaron.
2. **Patrones estructurales de "segundo orden"** — `detectStructuralSlopPatterns()`, sumado al mismo check `banned` (Content Quality, 7pts, ahora "Sin frases ni patrones de escritura genérica de IA"): cadencia de pregunta en ≥70% de los subtítulos, apertura de párrafo repetida ≥3 veces ("acá está por qué", "primero,", etc.), lista de ≥4 ítems con largo casi idéntico. Mismo hallazgo también sumado como categoría propia en `skills/humanizer` (handsOn-Worker).
3. **CTA placement** — `checkCtaPlacement()`, check nuevo `cta-placement` (categoría `brief`, informativo: cuenta para `briefCompliance`, no para el puntaje de 100). Falla si hay lenguaje de CTA antes del último 20% del artículo; warn si no se detecta ningún CTA o si hay más de 2 bloques.
4. **Canibalización de keyword** — check nuevo `keyword-cannibalization` (categoría `brief`, informativo). `analyzeArticle()` ahora recibe un 5º parámetro opcional `existingArticles: {slug, primaryKeyword}[]`; los 3 call sites (`generate`, `analyze`, cron `blog-pregenerate`) lo arman con `getExistingArticleKeywords()` (brief-service.ts, una query a `blog_articles` por `clientId`). Marca `warn` si otro artículo del mismo cliente ya targetea la misma keyword normalizada.

**No implementado, quedó en backlog:**
- **Schema-type eligibility downgrade (FAQPage/HowTo)** — blog-generator hoy NO emite ningún JSON-LD schema (se confirmó, no hay `FAQPage`/`HowTo` en ningún lado del pipeline), así que no hay nada que "degradar" todavía. Si algún día se suma generación de schema, ahí sí aplica el gotcha de `seo-geo`: FAQPage no da rich results en Google desde mayo 2026.
- **Orphan-link check** (¿el artículo nuevo queda enlazado desde alguna página existente?) — a diferencia de la canibalización, esto no es chequeable en el momento de generar: un artículo recién creado por definición todavía no lo linkeó nadie. Es un check de auditoría de sitio completo, no de analyzer por-artículo; candidato a un tool aparte, no a este analyzer.
- **Content decay/freshness, fact-check real de claims, verificación de accesibilidad de crawlers IA, integridad de links/imágenes, "echo cluster" de fuentes** — requieren fetch de red o comparar contra corridas anteriores; el analyzer hoy es 100% sync sin llamadas externas por diseño (regla 2 de "Reglas de diseño"). Quedan para cuando se decida romper esa restricción a propósito.

## Gotchas

- **Em dashes**: model tends to produce `—`. Rule blocks both `—` and `--`. Anti-AI-conversion check.
- **Slug formatting**: must have leading and trailing slash; no dates. `normalizeMeta()` enforces.
- **Cluster name must match exactly**: 400 if typo. Case-sensitive.
- **Author persona lookup**: `brief.authorPersonas.find(p => p.clusterName === cluster)`. If cluster has no persona, author fields blank — analyzer deducts eeat points.
- **GSC/Ads/GA4 not connected**: opportunities panel returns `[]` with `reason: 'no_brief'` or similar. Empty state messaging in UI.
- **Publish rejects score < 70**: change status to 'draft' to push as WP draft. Safety rail can be overridden only by editing code.
- **Performance cron reads channel_snapshots**: requires clients with GSC/GA4 integration + last 28d of snapshots. If missing, performance field stays empty for that article.
- **Calendar regeneration is destructive**: POST `/calendar/[clientId]` replaces the whole calendar. Manual edits to slots get wiped. Planned Nivel C+: diff-merge mode.

## When to use this skill

Trigger conditions:
- User asks to generate a blog post for any client
- User mentions "blog", "SEO article", "GEO content", "Yoast", "RankMath"
- User works on files under `src/lib/blog/`, `src/app/tools/blog-generator/`, `src/app/admin/blog-*`, `src/app/api/tools/blog-generator/`, or `src/types/blog.ts`
- User asks about `blog_briefs`, `blog_articles`, `blog_opportunities`, `blog_calendars`, `blog_wordpress_configs` Firestore collections
- User mentions a Lati Travel blog post or the Lati SEO/GEO strategy
- User asks "how does the blog generator work" or wants to onboard a new client to blog generation
- User works on SEO/GEO content strategy for any Worker Brain client

Do NOT trigger for:
- Email briefs (use `email-whatsapp-specialist` skill)
- Creative briefs / ads copy (use `creative-brain` skill)
- General SEO strategy without content production (use `gsc-seo` or `seo-geo` skill)
