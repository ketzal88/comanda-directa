# Ecommerce SEO Issues

## Critical Ecommerce-Specific Problems

### 1. Faceted Navigation Duplicate Content
**Problem:** Filters generate thousands of URLs (`/vestidos?color=rojo&talle=M`) — most have near-identical content and compete with each other.

**Solution:**
- Use `canonical` pointing to the clean category URL for filtered pages
- Block filter parameters in robots.txt for parameters with no SEO value
- Create dedicated landing pages only for high-volume filter combinations (e.g., "vestidos rojos" if it has 500+ monthly searches)

### 2. Product Schema Missing
**Problem:** Without `Product` + `Offer` schema, product pages miss rich results (price, availability, ratings in SERP).

**Required schema:**
```json
{
  "@type": "Product",
  "name": "...",
  "image": ["..."],
  "description": "...",
  "offers": {
    "@type": "Offer",
    "price": "...",
    "priceCurrency": "ARS",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.5", "reviewCount": "120" }
}
```

### 3. Thin Category Pages
**Problem:** Category pages with only a product grid and no text content (<300 words) have no ranking power.

**Solution:** Add 300-600 words of category-level content:
- Intro paragraph with the main keyword
- What makes the category useful/special
- Size guide or how-to-choose section
- FAQ at the bottom (with FAQPage schema)

### 4. Out-of-Stock Product Pages
**Problem:** Keeping empty product pages live (or letting them 404) wastes crawl budget and loses link equity.

**Solution:**
- Temporarily out of stock: keep page, add restock date, show related products, schema `availability: "OutOfStock"`
- Permanently discontinued: 301 redirect to the most relevant category or similar product
- Never let popular product pages become hard 404s

### 5. Duplicate Product Descriptions
**Problem:** Copy-pasting supplier descriptions creates duplicate content issues, especially across similar product variants.

**Solution:**
- Write unique descriptions for top-selling products first (follow Pareto: top 20% of SKUs drive 80% of revenue)
- For variants (same product, different color/size): use canonical pointing to main variant
- Minimum unique content per product page: product name, 3 differentiating attributes, 1 original sentence

### 6. Crawl Budget Waste
**Problem:** Googlebot wastes crawl budget on parameter URLs, pagination duplicates, internal search results.

**Solution:**
- Block in robots.txt: `?sort=`, `?view=`, `?ref=`, internal search results (`/buscar?q=`)
- Implement `rel="next"` / `rel="prev"` for pagination (or use canonical to first page for duplicate paginates)
- Prioritize crawl budget for new products and recently updated content

## Collection/Category Page Audit

For each category page, check:
- [ ] Has 300+ words of unique, keyword-relevant text
- [ ] Title tag includes category keyword near the start
- [ ] H1 = category name (with keyword)
- [ ] Breadcrumb with `BreadcrumbList` schema
- [ ] `FAQPage` schema with 3-5 questions about this category
- [ ] Internal links to subcategories and top 3-5 products
- [ ] Canonical = self (not pointing to a filter/sort variant)
- [ ] No `noindex` accidentally applied

## Product Page Audit

For each product page, check:
- [ ] Title: `[Product Name] — [Brand] | Precio y envío en [store]` (60 chars max)
- [ ] Meta description includes price or key differentiator + CTA (155 chars max)
- [ ] H1 = product name
- [ ] `Product` + `Offer` schema with price, availability, brand
- [ ] `AggregateRating` schema if reviews exist
- [ ] Images with descriptive alt text (not `IMG_1234.jpg`)
- [ ] Internal links to category page and 2-3 related products
- [ ] Canonical = self (for main variant); variants point to main

## Ecommerce Keyword Mapping Strategy

Map keywords to page types:

| Keyword Intent | Example | Page Type |
|---|---|---|
| Category browse | "zapatillas running mujer" | Category page |
| Specific product | "Nike Air Max 270 mujer blancas talle 38" | Product page |
| Research | "mejores zapatillas para correr 2024" | Blog comparison |
| Problem-aware | "qué zapatillas usar para maratón" | Blog guide |
| Brand + category | "Nike zapatillas running" | Brand subcategory page |
| Local | "zapatillas deportivas Buenos Aires" | Location landing page (if applicable) |

## Technical Audit Checklist (Quick)

Run this when auditing a client's site:
- [ ] robots.txt allows Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot
- [ ] Sitemap submitted to GSC and returns 200
- [ ] HTTPS everywhere — no HTTP links or mixed content
- [ ] Core Web Vitals passing: LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] Mobile-friendly (Google Mobile-Friendly Test)
- [ ] No redirect chains > 1 hop
- [ ] No `noindex` on pages that should be indexed
- [ ] Structured data validates in Google Rich Results Test
