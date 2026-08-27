# GSC Data Analysis & Benchmarks

## Core Metrics

| Metric | Description | Key Insight |
|---|---|---|
| Clicks | Users who clicked a result | Direct traffic impact |
| Impressions | Times a result appeared | Visibility (even without click) |
| CTR | clicks / impressions | Measures title/meta effectiveness |
| Avg Position | Average ranking position | Lower is better (1 = top) |

## CTR Benchmarks by Position

| Position | Expected CTR | If Below → Action |
|---|---|---|
| 1 | 28-35% | Title not compelling, SERP features stealing clicks |
| 2-3 | 10-15% | Opportunity to push to #1 with content depth |
| 4-10 | 3-8% | High ROI — optimizing title/H1 can jump to top 3 |
| 11-20 | 1-3% | Create deeper content to enter page 1 |
| 21+ | <1% | Essentially invisible — major content needed |

## Opportunity Identification Framework

### Tier 1: Quick Wins (High Impact, Low Effort)
- Position 4-10 + impressions > 500/month + CTR below benchmark
- Action: Optimize title tag (include keyword near start), improve meta description with a CTA

### Tier 2: Content Opportunities (Medium Effort)
- Impressions > 200/month + position 11-20 + any CTR
- Action: Expand existing content, add FAQ section, improve internal links

### Tier 3: New Content (Higher Effort)
- Impressions > 100/month + position 21+
- Action: Create dedicated landing page targeting this keyword cluster

### Tier 4: CTR Issues
- Position 1-3 but CTR < 15% → SERP features (featured snippets, ads, images) above organic
- Action: Implement FAQ schema, target featured snippet format, check if branded query

## Device Breakdown Analysis

- Mobile typically has 10-20% lower CTR than desktop for same position
- If mobile > 70% of impressions but CTR lags desktop: mobile title truncation issue
- If mobile position significantly worse than desktop: mobile UX or Core Web Vitals problem
- Tablet usually negligible volume; focus on mobile vs desktop

## Common GSC Patterns and Diagnoses

### High Impressions, Very Low CTR (<1%)
- **Position > 15**: content doesn't rank well enough → invest in content depth
- **Position 1-5**: SERP dominated by ads or rich results → implement schema, target featured snippet
- **Branded query**: user searching for brand name but clicking a different result → check brand consistency

### CTR Dropped Despite Stable Position
- Google may have added a SERP feature (featured snippet, knowledge panel) above organic
- Competitor got a rich result (stars, FAQ, image) that draws more attention
- Seasonality: some queries have lower intent in certain months

### Position Dropped Suddenly
- Content update by Google algorithm (check Search Console "Search type" filter for any anomaly)
- Competitor published a better article
- Page speed or Core Web Vitals regression

### Page Data vs Query Data Gap
- A page can rank for hundreds of queries beyond what you intended
- Check top pages → pick a high-traffic page → see which queries send traffic → often reveals unintended ranking opportunities

## Argentina-Specific Notes

- Spanish-language queries: long-tail tends to be more colloquial ("cuanto sale" vs "precio de")
- Local intent: queries with "Argentina", "Buenos Aires", "CABA" have very different competition than generic Spanish
- Mobile-first market: expect 60-70%+ mobile impressions for most consumer brands
- Seasonality peaks: Día de la Madre (October), Día del Padre (June), Navidad (December), Hot Sale (May), CyberMonday (November)

## Data Lag Handling

GSC data has a 2-3 day lag at the API level. Worker Brain syncs `D-3` (three days ago). This is expected behavior — always mention it when comparing GSC data to same-day paid/ecommerce data.

When the analyst sees "no data for yesterday" in GSC, this is normal.