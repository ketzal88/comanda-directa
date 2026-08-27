# Content Strategy Framework

## Search Intent Classification

Always identify intent before recommending content type:

| Intent | Signal | Best Content Type |
|---|---|---|
| Informacional | "cómo", "qué es", "por qué", "cuánto cuesta" | Blog, FAQ, guía |
| Comercial | "mejor", "recomendación", "comparativa", "vs" | Comparativa, landing de categoría, review |
| Transaccional | "comprar", "precio", "oferta", "envío" | Product/category landing page, ficha de producto |
| Navegacional | brand name, URL patterns | Brand landing, homepage optimization |

## Content Types and When to Use

### blog
Informacional intent. 1500-2500 words. H1 = keyword. FAQ section at bottom. Target: impressions > 300, position 11-30.

### landing
Transaccional or comercial. 800-1500 words. Strong CTA. Product schema. Target: paidNotOrganic gaps where we're spending budget.

### faq
Bundle of 8-15 related questions. FAQPage schema. Excellent for GEO (LLM citations). Target: question-format queries ("cuánto cuesta X", "cómo funciona Y").

### comparison
"X vs Y" or "Mejores X para Y" format. Commercial intent. 2000-3500 words. Use comparison tables. Target: competitor keywords, category decisions.

### category
Ecommerce category page. 300-600 word intro + product grid. Target: category-level terms ("vestidos de fiesta", "zapatillas running mujer").

## Content Brief Structure

When generating a content brief, always include:

```
Título H1: [exact keyword near start]
Intención: informacional / comercial / transaccional
Keyword principal: [exact term]
Keywords secundarias: [3-5 related terms]
Word count target: [per type above]
Estructura:
  H1: [title]
  H2: [main section 1]
    H3: [subsection if needed]
  H2: [main section 2]
  H2: FAQ — Preguntas frecuentes (always include if > 1000 words)
    H3: ¿[question 1]?
    H3: ¿[question 2]?
Competidores a superar: [top 3 ranking pages]
Diferenciadores: [what makes this better]
CTAs: [1 primary, 1 secondary]
Links internos: [3-5 pages to link to/from]
Schema: [FAQPage / Product / Article / BreadcrumbList]
```

## Programmatic SEO Patterns (for ecommerce)

When there are hundreds of similar-intent keywords, use programmatic patterns instead of individual articles:

| Pattern | Example | Use Case |
|---|---|---|
| Location pages | "[producto] en [ciudad]" | Local delivery, regional intent |
| Persona pages | "[producto] para [audiencia]" | Segment targeting |
| Comparison pages | "[marca A] vs [marca B]" | Competitor intent |
| Category × attribute | "[color] [producto]", "[talle] [ropa]" | Faceted category landing |
| Glossary | "qué es [término]" | Top-of-funnel, brand awareness |

**Warning:** Each programmatic page must have unique content beyond variable substitution. Google penalizes doorway pages — use real product data, reviews, regional specifics.

## Argentina Content Calendar — Seasonal Peaks

| Month | Event | Content Focus |
|---|---|---|
| Marzo | Inicio ciclo escolar | Vuelta a clases, uniformes, útiles |
| Mayo | Hot Sale (mid-month) | Comparativas de precio, guías de compra |
| Junio | Día del Padre | Gift guides, recomendaciones para él |
| Agosto | Día del Niño | Juguetes, ropa infantil, gift cards |
| Octubre | Día de la Madre | Gift guides, recomendaciones para ella |
| Noviembre | CyberMonday | Ofertas, comparativas, timing de compra |
| Diciembre | Navidad + Fin de Año | Regalos, mesas, moda de fiesta |

Create evergreen seasonal content 4-6 weeks before the event. Update the same URL each year (don't create new pages).

## Internal Linking Architecture

Follow hub-and-spoke for SEO weight concentration:

```
Homepage
  └─ Category Page (Hub)
       ├─ Product Page (Spoke)
       ├─ Product Page (Spoke)
       └─ Blog/Guide related to category (Spoke)
            └─ Links back to Category Page (closing the loop)
```

Rules:
- 3-5 internal links per new article minimum
- Link from high-traffic pages to new content (passes link equity)
- Use descriptive anchor text with the target keyword (not "hacer clic aquí")
- Category pages link to blog content, blog content links back to category/product pages

## E-E-A-T Signals for Ecommerce

Google weights Experience, Expertise, Authoritativeness, Trustworthiness:

**Experience signals:**
- Own photos (not stock photos)
- Video content featuring the product
- Customer reviews with specific details
- "X clientes compraron esto este mes"

**Expertise signals:**
- Author bio with credentials
- Detailed product specifications (not copied from supplier)
- Comparison tables with real data

**Authority signals:**
- Press mentions (link from third-party media)
- Backlinks from industry blogs
- Social proof numbers (total orders, rating count)

**Trust signals:**
- SSL + HTTPS (obvious but essential)
- Clear return/shipping policy linked from product pages
- Business address and contact info in footer
- Trustpilot or Google Reviews widget

## Word Count Guidelines

| Content Type | Min | Ideal | Max |
|---|---|---|---|
| Category page | 300 | 500 | 800 |
| Product page | 200 | 400 | 600 |
| Blog post | 800 | 1500 | 2500 |
| Comparison article | 1200 | 2000 | 3500 |
| Pillar/guide | 2500 | 4000 | 7000 |
| FAQ page | 600 | 1000 | 2000 |

More isn't always better — thin content at 500 words that answers the question clearly beats a padded 3000-word article.