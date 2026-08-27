# Skills Index — handsOn-Worker

Biblioteca de skills para trabajo de marketing digital en Worker. **100 skills**, agrupadas por caso de uso.

> **Cómo se usa:** estos archivos son contenido de referencia, no auto-loaded. Cuando trabajes en un tema, pedile a Claude que lea el skill relevante (ej: "leé `skills/positioning-basics/SKILL.md` antes de armar el brief").
> Para skills auto-loaded (claude-ads:\*, claude-blog:\*, seo-\*, n8n-\*, vercel:\*, figma:\*, etc.) usá la lista de plugins instalados — no están duplicados acá.

---

## 1. Agencia — propuestas, reportes, onboarding de cliente

Para tu trabajo de Worker con clientes: kickoff, deliverables mensuales, ventas propias.

| Skill | Cuándo usarlo |
|---|---|
| [account-manager](account-manager/SKILL.md) | Gestión de cuenta, comunicación con cliente, escalado interno |
| [worker-proposals](worker-proposals/SKILL.md) | **Canónico para entregar** — arma la propuesta/deck en HTML con el design system v2 y la publica en brain.worker.ar. Usar siempre que el output vaya al cliente |
| [market-proposal](market-proposal/SKILL.md) | Generador del *contenido* comercial: discovery questions + pricing tiered. Para el formato y la publicación, ver `worker-proposals` |
| [reporte-mensual](reporte-mensual/SKILL.md) | **Canónico para el cierre de mes** — reporte de gestión de un cliente con datos del Brain: mes contra mes, qué pasó (desde el worklog) y publicación en el Brain |
| [market-report](market-report/SKILL.md) | Compilar auditorías ya corridas en un informe Markdown con scores y plan de acción (no es el cierre de mes) |
| [market-report-pdf](market-report-pdf/SKILL.md) | Versión PDF de ese informe de auditoría |
| [case-study-builder](case-study-builder/SKILL.md) | Convertir un caso ganador en case study formal para ventas |
| [testimonial-collector](testimonial-collector/SKILL.md) | Extraer testimonios de conversaciones / mails de clientes |
| [voice-extractor](voice-extractor/SKILL.md) | Extraer brand voice del cliente a partir de samples (onboarding) |
| [meeting-prep](meeting-prep/SKILL.md) | Notas pre-reunión con cliente — agenda, contexto, objetivos |
| [onboarding-sop](onboarding-sop/SKILL.md) | SOP de onboarding de nuevos clientes (Worker interno) |
| [marketing-principles](marketing-principles/SKILL.md) | Gut-check estratégico con principios de Drucker, Ogilvy, Hopkins |
| [linkedin-authority-builder](linkedin-authority-builder/SKILL.md) | Construir autoridad en LinkedIn (para Worker, no para clientes) |
| [worker-team-hub](worker-team-hub/SKILL.md) | Hub del equipo Worker |
| [tl-diseno](tl-diseno/SKILL.md) | Team lead de diseño |
| [tl-paid-media](tl-paid-media/SKILL.md) | Team lead de paid media |
| [disenador-ads](disenador-ads/SKILL.md) | Diseñador de ads |

---

## 2. Paid Media — Meta (Facebook, Instagram)

Skills consolidados de Meta. Para el día a día usá los plugins `claude-ads:ads-meta`, `claude-ads:audit-meta`. Estos son knowledge bases más profundos.

| Skill | Cuándo usarlo |
|---|---|
| [paid-ads-meta](paid-ads-meta/SKILL.md) | **Canónico Meta** — Parte 0: research previo (5 fuentes, banco de frases, mapa de brecha de personas, lectura de Ads Library). Parte 8: framework GEM + Andromeda + Diversity Score (briefs en castellano, HTML dark-themed) |
| [ad-copy-deck](ad-copy-deck/SKILL.md) | **Formato de entrega de copies** (Meta y Google) — campos, límites de caracteres y página con botones de copiar. El qué escribir sale de `paid-ads-meta`; esto es el cómo entregarlo |
| [meta-ads-creative](meta-ads-creative/SKILL.md) | 6-Elements framework, ad formats library, copywriting formulas, research methods |
| [meta-api-expert](meta-api-expert/SKILL.md) | Meta Ads API: fields, insights, implementation patterns |
| [meta-campaign-builder](meta-campaign-builder/SKILL.md) | Crear campañas Meta por API o por el MCP oficial, con spec confirmada y verificación post-creación |
| [paid-ads](paid-ads/SKILL.md) | Paid ads general (Google/Meta/LI/X) — estrategia, audiencias, copy |
| [paid-media-specialist](paid-media-specialist/SKILL.md) | Rol de specialist paid media |
| [performance-creative-strategy](performance-creative-strategy/SKILL.md) | Estrategia de creatives para performance |

---

## 3. Paid Media — Google Ads

Knowledge bases. Para auditorías usá `claude-ads:audit-google`.

| Skill | Cuándo usarlo |
|---|---|
| [google-ads-api](google-ads-api/SKILL.md) | Google Ads API + GAQL queries + google-ads-api npm package |
| [google-ads-ops](google-ads-ops/) | 8 sub-skills ops: anomaly-cpa, audit-account, budget-triage, cannibalization, creative-rotation, quality-score, search-terms, wasted-spend |
| [google-ads-skills](google-ads-skills/) | 21 sub-skills: ad-copy, ad-extensions, anomaly-detection, attribution, audiences, audit-ecommerce, audit-leadgen, bidding, budget-management, conversion-tracking, experiments, keyword-cannibalization, keywords, negative-keywords, quality-score, scripts, search-term-mining, segmentation, utm-generator, ad-extension-audit, account-audit |

---

## 4. Paid Media — Direct-Response (Schwartz framework — Kim Barrett)

12 skills basados en Eugene Schwartz **Breakthrough Advertising**. Aplican a cualquier plataforma (Meta, Google, LinkedIn). Trae disciplina DR que claude-ads no tiene.

> Estos skills trabajan sobre una oferta **que ya existe**. Si la oferta misma es el problema (buen CTR, mal CPA), construila primero con [grand-slam-offer](grand-slam-offer/SKILL.md) y recién después entrá por `offer-extraction`.

| Skill | Cuándo usarlo |
|---|---|
| [avatar-extraction](avatar-extraction/SKILL.md) | Extraer avatar del cliente ideal — paso 0 de cualquier campaña |
| [offer-extraction](offer-extraction/SKILL.md) | Definir la oferta real — qué se promete, a quién, por qué ahora |
| [schwartz-awareness-mapper](schwartz-awareness-mapper/SKILL.md) | Mapear awareness del prospect (unaware → problem-aware → solution-aware → product-aware → most-aware) — define ángulo |
| [mechanism-builder](mechanism-builder/SKILL.md) | Construir el "unique mechanism" que diferencia tu oferta |
| [headline-matrix](headline-matrix/SKILL.md) | Generar matriz de headlines por awareness level + angle |
| [objection-crusher](objection-crusher/SKILL.md) | Listar y refutar objeciones en copy |
| [ad-angle-multiplier](ad-angle-multiplier/SKILL.md) | Generar múltiples ángulos para testear con un mismo producto |
| [scroll-stopping-creative](scroll-stopping-creative/SKILL.md) | Frameworks de hooks visuales para parar el scroll |
| [conversion-path-builder](conversion-path-builder/SKILL.md) | Diseñar el path completo de ad → landing → conversión |
| [performance-diagnosis](performance-diagnosis/SKILL.md) | **Canónico para decidir sobre presupuesto** — de dónde salen los números (trampas del brief), KPI según objetivo, umbrales del negocio, tabla de cuello de botella y reglas de apagado/escalado calibradas para ARS |
| [full-funnel-campaign-orchestrator](full-funnel-campaign-orchestrator/SKILL.md) | Orquestar TOFU + MOFU + BOFU en un lote coherente |
| [generic-language-killer](generic-language-killer/SKILL.md) | QA — eliminar lenguaje genérico/templateado del copy |

---

## 5. SEO + GEO

Para audits/análisis usá los plugins `seo-audit`, `seo-technical`, `seo-page`, `seo-cluster`, `seo-geo`. Estos son knowledge bases custom.

| Skill | Cuándo usarlo |
|---|---|
| [seo-geo](seo-geo/SKILL.md) | GEO (Generative Engine Optimization) + SEO foundations. **Incluye Princeton 2024 data** (boosts y anti-patterns) y tactics por LLM (ChatGPT, Perplexity, Gemini) |
| [gsc-seo](gsc-seo/SKILL.md) | Search Console — análisis, queries, integration |

---

## 6. Email & WhatsApp

| Skill | Cuándo usarlo |
|---|---|
| [email-whatsapp-specialist](email-whatsapp-specialist/SKILL.md) | Specialist email + WhatsApp marketing |
| [klaviyo-api](klaviyo-api/SKILL.md) | Klaviyo API — flows, segmentación, campañas, metrics |
| [perfit-api](perfit-api/SKILL.md) | Perfit (email tool argentino) — API integration |
| [cold-email](cold-email/SKILL.md) | Cold outreach B2B — sequences, follow-ups, deliverability |

---

## 7. B2B — leads, prospecting, GTM

Para tus 9 clientes B2B.

| Skill | Cuándo usarlo |
|---|---|
| [marketing-manager-leads](marketing-manager-leads/SKILL.md) | **Brain principal B2B** — funnels, CPL, qualification, nurturing, VSL, GHL integration |
| [positioning-basics](positioning-basics/SKILL.md) | Workshop de positioning para B2B (April Dunford-style) |
| [grand-slam-offer](grand-slam-offer/SKILL.md) | Armar la oferta de un servicio cuando no cierra — resultado, stack, prueba y escalones DFY/DWY/DIY |
| [prospecting](prospecting/SKILL.md) | B2B prospecting frameworks |
| [lead-magnets](lead-magnets/SKILL.md) | Diseño de lead magnets B2B |
| [free-tools](free-tools/SKILL.md) | Build free tools como lead-gen para B2B |
| [lead-research-assistant](lead-research-assistant/SKILL.md) | ICP analysis + target company search + outreach strategies |
| [sales-enablement](sales-enablement/SKILL.md) | Material de sales enablement |
| [product-marketing](product-marketing/SKILL.md) | PMM frameworks para B2B |
| [co-marketing](co-marketing/SKILL.md) | Partnerships y co-marketing |
| [referrals](referrals/SKILL.md) | Programas de referral |

---

## 8. Ecommerce

Para tus clientes ecommerce.

| Skill | Cuándo usarlo |
|---|---|
| [ecommerce-marketing-manager](ecommerce-marketing-manager/SKILL.md) | **Brain principal ecommerce** — cross-channel, ROAS, LTV:CAC, GEM/Andromeda |
| [tienda-data-triage](tienda-data-triage/SKILL.md) | Llegó un export de pedidos/productos/clientes y hay que sacar decisiones de ahí |
| [tienda-oferta-builder](tienda-oferta-builder/SKILL.md) | Armar una promo con piso de margen y ROAS de equilibrio, antes de elegir el descuento |
| [landing-generator](landing-generator/SKILL.md) | Página de producto completa (ficha PDP + narrativa de venta) en un HTML para maquetar en la tienda del cliente. Prueba social y métricas van como placeholder, nunca inventadas |
| [shopify-api](shopify-api/SKILL.md) | Shopify API |
| [tiendanube-api](tiendanube-api/SKILL.md) | Tiendanube API (ecom argentino) |
| [woocommerce-api](woocommerce-api/SKILL.md) | WooCommerce API |

---

## 9. SaaS / product marketing

Si tomás clientes SaaS.

| Skill | Cuándo usarlo |
|---|---|
| [pricing](pricing/SKILL.md) | Pricing strategy SaaS |
| [onboarding](onboarding/SKILL.md) | Activation flow post-signup |
| [churn-prevention](churn-prevention/SKILL.md) | Save offers, cancellation flows, retention |
| [popups](popups/SKILL.md) | CRO — popups y modales |

---

## 10. Content, social, video

| Skill | Cuándo usarlo |
|---|---|
| [blog-generator](blog-generator/SKILL.md) | Generador de blog (usá junto a `claude-blog:*` plugins) |
| [community-manager](community-manager/SKILL.md) | Community manager — calendars, captions, Reels, stories, engagement |
| [creative-brain](creative-brain/SKILL.md) | Workspace creativo Worker Brain — hooks, guiones, copy, humanizer |
| [reel-creator](reel-creator/SKILL.md) | **Guion de reel completo** (IG/TikTok) — Hook → Retain → Reward + catálogo de 8 formatos. El gancho sale de `viral-hooks`; esto es la estructura del guion |
| [viral-hooks](viral-hooks/SKILL.md) | Cuando hay que abrir un contenido orgánico (Reel, TikTok, carrusel, founder story) y necesitás el gancho de los primeros 3 segundos |
| [youtube-to-social](youtube-to-social/SKILL.md) | YouTube URL → Reel script o carousel LI/IG (incluye scripts python + assets) |
| [video-ad-analysis](video-ad-analysis/SKILL.md) | Usar `/watch` (plugin claude-video) para analizar un video puntual — ad de competencia, ad propio, reel — antes de escribir copies o diagnosticar creative |

---

## 11. Research & intelligence

| Skill | Cuándo usarlo |
|---|---|
| [last30days](last30days/SKILL.md) | Qué se está diciendo sobre un tema en los últimos 30 días — posts y engagement de Reddit, X, YouTube, TikTok, HN, Polymarket, GitHub y la web. Único en su categoría. |
| [competitive-ads-extractor](competitive-ads-extractor/SKILL.md) | Scrapear FB/LI ad libraries de competencia + analizar messaging |
| [marketing-psychology](marketing-psychology/SKILL.md) | Principios de persuasión e influencia (Cialdini-style) |

---

## 12. Writing quality

| Skill | Cuándo usarlo |
|---|---|
| [humanizer](humanizer/SKILL.md) | **Eliminar AI tells de texto.** Soporte español neutro + rioplatense (voseo). Wikipedia "Signs of AI writing" + tells específicos castellano. |
| [generic-language-killer](generic-language-killer/SKILL.md) | QA específico para copy DR — elimina lenguaje genérico |

---

## 13. Worker internal — sistema, tracking, ops

Skills que documentan tu stack interno (Worker Brain).

| Skill | Cuándo usarlo |
|---|---|
| [alerts-system](alerts-system/SKILL.md) | Sistema de alerts + Slack messaging + crons |
| [worker-brain-guide](worker-brain-guide/SKILL.md) | Guía general Worker Brain |
| [worker-brain-training](worker-brain-training/SKILL.md) | Training de Worker Brain |
| [worker-cron](worker-cron/SKILL.md) | Sistema de crons |
| [worker-firestore](worker-firestore/SKILL.md) | Firestore — schemas, queries, patterns |
| [worker-slack-formatting](worker-slack-formatting/SKILL.md) | Slack message formatting Worker |
| [worker-ast-rules](worker-ast-rules/SKILL.md) | AST rules para código Worker |
| [ga4-api](ga4-api/SKILL.md) | GA4 Data API — para tracking custom |

---

## 14. Tech / dev (para el equipo dev del Brain)

| Skill | Cuándo usarlo |
|---|---|
| [playwright-cli](playwright-cli/SKILL.md), [playwright-best-practices](playwright-best-practices/SKILL.md), [playwright-explore-website](playwright-explore-website/SKILL.md), [playwright-generate-test](playwright-generate-test/SKILL.md), [playwright-automation-fill-in-form](playwright-automation-fill-in-form/SKILL.md) | Automatización web — fill forms, scraping, E2E tests |
| [graphql-schema](graphql-schema/SKILL.md) | GraphQL — naming, pagination, security, types, errors |
| [vercel-react-best-practices](vercel-react-best-practices/SKILL.md) | React + Vercel best practices (50+ rules en `rules/`) |
| [llm-app-patterns](llm-app-patterns/SKILL.md) | Patterns para apps con LLM |
| [agent-orchestration-multi-agent-optimize](agent-orchestration-multi-agent-optimize/SKILL.md) | Orquestación multi-agent |
| [agent-tool-builder](agent-tool-builder/SKILL.md) | Construir tools para agents |
| [error-debugging-multi-agent-review](error-debugging-multi-agent-review/SKILL.md) | Multi-agent code review |
| [skill-creator](skill-creator/SKILL.md) | Crear nuevos skills bien formados |
| [ui-ux-pro-max](ui-ux-pro-max/SKILL.md) | UX/UI sénior |
| [design-md](design-md/SKILL.md) | Analizar proyectos Stitch → DESIGN.md |
| [impeccable](impeccable/SKILL.md) | Code quality framework |

---

## Patrones de orquestación recomendados (no son skills — son cambios de workflow)

Sugerencia del research para escalar a tus 9 clientes en paralelo:

1. **Anthropic Agent Teams** (gratis, ya en Claude Code 2.1.32+): activar con `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` en `~/.claude/.env`. Habilita `/team-plan` y `/team-build` para coordinar specialists.
2. **Git worktree por cliente** (patrón de Claude Squad): cada cliente en su propio worktree → 9 clientes en paralelo sin pisarse contextos.
3. **5-tier complexity routing** en `CLAUDE.md`: trivial → directo, moderate → 1 subagent, complex → `/team-plan`, collaborative → `/team-build`, unclear → context-first.
4. **`worker-orchestrator` agent**: agente raíz que rute `(cliente × tipo-tarea) → specialist`. Por ejemplo: "audit Meta cliente X" → spawn `claude-ads:audit-meta` con contexto del cliente.

---

## Decisiones de consolidación tomadas en esta limpieza

- **Borrado:** `paid-ads-skills-claude.md` y `paid-ads-meta-worker.skill` (duplicados viejos de `paid-meta-skill-concept-nathan.md` — este último promovido a `paid-ads-meta/` con la Parte 8 GEM/Andromeda).
- **No instalado** (por duplicar lo que ya tenés mejor):
  - `de-ai-ify` (BrianRWagner) — tu `humanizer` ya cubre y mejor (tiene rioplatense)
  - Todo `hyperfx-ai/*` — vendor lock a Hyper MCP, sin valor agregado
  - Todo `alirezarezvani/marketing-skill/*` — es una copia bulk de coreyhaines + relleno AI
  - `coreyhaines/{ads,ad-creative,emails,seo-audit,schema,programmatic-seo,ai-seo,marketing-plan,content-strategy}` — claude-ads/seo-\*/email-whatsapp-specialist/claude-blog ya cubren
  - Todo `BrianRWagner/{plan-my-day,last30days,daily-briefing-builder,vault-cleanup-auditor,tweet-draft-reviewer,go-mode,linkedin-profile-optimizer,homepage-audit,social-card-gen,newsletter-creation-curation,ai-discoverability-audit,content-idea-generator,youtube-summarizer}` — fluff personal o duplicados
  - `zubair-trabzada/{market-ads,market-emails,market-seo,market-social,market-copy,market-audit,market-brand,market-competitors,market-funnel,market-landing,market-launch}` — versiones genéricas de lo que ya tenés mejor
- **Princeton 2024 anti-patterns** agregados a `seo-geo` (keyword stuffing −10%, hedging −5%, stale content −5/−15%).
