# KW Gap Analysis Engine

## The Three Gap Categories

### 1. organicNotPaid — Opportunity Content or Paid Amplification
Keywords with organic impressions > 100 but no Ads match.

**Meaning:** Users find us organically for these terms, but we're not reinforcing them with paid.

**Possible actions:**
- If organic position <= 5: content is already winning — no ads needed. Create more depth/related content.
- If organic position 6-15: invest in ads to capture top-of-page visibility while SEO catches up.
- If organic position 16+: create dedicated landing page before spending on ads.

**Opportunity score formula:** `impressions × (1 - ctr / benchmark_ctr) × intent_factor`
- `benchmark_ctr` = from CTR table by position
- `intent_factor`: transaccional = 1.5, comercial = 1.2, informacional = 0.8

### 2. paidNotOrganic — Urgent SEO Dependency
Ads search terms with spend > $0 where organic position > 20 or keyword absent from GSC.

**Meaning:** We're paying for every click because we don't rank organically. Stop paying = stop getting traffic.

**Risk level:**
- High spend + no organic rank → critical dependency, any budget cut kills this traffic
- Medium spend + rank 11-20 → build organic to reduce paid reliance
- Low spend → just create a content piece, low urgency

**Suggested actions:**
- Create dedicated landing page targeting this exact term
- Add FAQ schema to existing product/service pages
- Internal link boost from homepage or category pages

### 3. cannibalized — Wasting Budget on Already-Won Keywords
Keywords present in both GSC (organic position <= 5) and active Ads spend.

**Meaning:** We're paying for clicks we're already getting for free.

**Decision framework:**
- Organic position 1-2 + Ads active: strong signal to pause ads (ROAS on this keyword is artificially inflated by organic)
- Organic position 3-5: consider testing 2-week pause to measure incrementality
- Organic position 1-5 on brand query + brand campaign: brand campaigns serve protection purposes, keep

**Exception:** Competitor bidding on our brand → keep brand campaign even if organic #1.

---

## Matching Algorithm

### Step 1: Exact Normalized Match
```
normalize(kw) = kw.toLowerCase().trim().replace(/\s+/g, ' ')
```
Match if `normalize(gscQuery) === normalize(adsSearchTerm)`.

### Step 2: Token Overlap (Jaccard Similarity)
For multi-word queries (>= 2 words each):
```
jaccard = |intersection(tokens_a, tokens_b)| / |union(tokens_a, tokens_b)|
if jaccard >= 0.7 → match
```

**Example matches:**
- `"zapatos cuero mujer"` ↔ `"zapatos de cuero mujer"` → jaccard = 3/4 = 0.75 ✓
- `"vestido largo"` ↔ `"vestido corto"` → jaccard = 1/2 = 0.5 ✗

**False positive prevention:** Completely unrelated keywords (jaccard < 0.5) never match, even with shared stop words.

---

## Opportunity Score 0-100

Higher score = prioritize first.

```
opportunityScore = Math.min(100, Math.round(
  (impressions / 1000) * 20 +       // volume weight
  (1 - position / 50) * 40 +        // position quality (closer to 1 = higher)
  commercialIntentBonus              // 20 for transactional, 10 for commercial, 0 for informational
))
```

Clamp to 0-100.

---

## Suggested Actions by Gap Type

| Gap Type | Organic Position | Ads Spend | Suggested Action |
|---|---|---|---|
| organicNotPaid | 1-5 | – | Crear contenido relacionado / cluster temático |
| organicNotPaid | 6-15 | – | Amplificar con ads mientras SEO mejora |
| organicNotPaid | 16+ | – | Crear landing page dedicada |
| paidNotOrganic | 21+ | Cualquiera | Urgente: crear contenido para reducir dependencia |
| paidNotOrganic | 11-20 | Alto | Profundizar contenido existente + linkbuilding interno |
| cannibalized | 1-2 | Cualquiera | Pausar ads en este keyword (testeá 2 semanas) |
| cannibalized | 3-5 | Alto | Testear reducción de bid o pausa parcial |

---

## Integration Points

- `gscQueries` comes from `rawData.queries[]` of the last 30 days aggregated GSC snapshots
- `adsSearchTerms` comes from `rawData.searchTerms[]` of the last 30 days aggregated Google Ads snapshots
- Both read from `channel_snapshots` collection — no additional API calls in the gap engine
- The engine is a pure function (zero DB access) — follows the AlertEngine pattern