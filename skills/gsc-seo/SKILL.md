---
name: gsc-seo
description: GSC + SEO Intelligence for Worker Brain — interpreting Google Search Console data, KW gap analysis between organic and paid, content strategy, ecommerce SEO. Use when working on Canal GSC (/channels/search-console), Canal SEO (/channels/seo), gsc-service.ts, seo-gap-engine.ts, AI Analyst prompts for search_console/seo channels, or content suggestions.
---

# GSC + SEO Intelligence — Worker Brain

This skill covers the full implementation and analytical knowledge for the GSC and SEO channels.

## References

- [GSC Data Analysis & Benchmarks](references/gsc-analysis.md)
- [KW Gap Analysis Engine](references/kw-gap-analysis.md)
- [Content Strategy Framework](references/content-strategy.md)
- [Ecommerce SEO Issues](references/ecommerce-seo.md)

---

## Architecture Quick Reference

### Data Flow

```
GSC API (searchanalytics.query)
  → gsc-service.ts
  → channel_snapshots: { channel: 'GSC', date: 'YYYY-MM-DD' }
      metrics: { clicks, impressions, ctr, avgPosition }
      rawData: { queries[], pages[], devices{} }
```

**Important:** GSC data has a 2-3 day lag. Cron syncs `D-3`, not yesterday. The UI shows a banner explaining this.

### Key Files

| File | Purpose |
|---|---|
| `src/lib/gsc-service.ts` | GSC API client, normalize, write to Firestore |
| `src/lib/seo-gap-engine.ts` | Pure gap analysis: organic vs paid cross-reference |
| `src/app/api/cron/sync-gsc/route.ts` | Daily sync cron |
| `src/app/api/seo/gaps/route.ts` | Runs gap engine for a client |
| `src/app/api/seo/content-suggestions/route.ts` | Claude SSE content suggestions |
| `src/components/pages/SearchConsoleChannel.tsx` | Canal GSC UI |
| `src/components/pages/SeoChannel.tsx` | Canal SEO UI (3 tabs) |

### AI Analyst Integration

- `search_console` → ChannelId → `CHANNEL_TO_FIRESTORE` → `'GSC'`
- `seo` → ChannelId → `CHANNEL_TO_FIRESTORE` → `'GSC'` (also reads Google Ads searchTerms)
- Both channels are in `src/lib/ai-analyst/types.ts` `DEFAULT_SUGGESTED_QUESTIONS`

### GSC Types (channel-rawdata.ts)

```typescript
GSCRawQuery: { query, clicks, impressions, ctr, position }
GSCRawPage:  { page, clicks, impressions, ctr, position }
GSCRawData:  { queries: GSCRawQuery[], pages: GSCRawPage[], devices: { mobile, desktop, tablet } }
```

### Gap Engine Types (seo-gap-engine.ts)

```typescript
SeoGapEngineInput: { gscQueries, adsSearchTerms, topPages }
SeoGapResult: { organicNotPaid: KwGap[], paidNotOrganic: KwGap[], cannibalized: KwGap[] }
KwGap: { keyword, gscClicks, gscImpressions, gscPosition, adsSpend, adsConversions, opportunityScore, suggestedAction }
```

Matching: exact normalized (lowercase + trim) first, then Jaccard similarity >= 0.7 for multi-word.

### Content Suggestions (seo/content-suggestions route)

- Model: `claude-sonnet-4-6`
- Input: top 20 `organicNotPaid` gaps + client `brandProfile` + top 10 existing pages
- Output: `ContentSuggestion[]` with `type: 'blog' | 'landing' | 'faq' | 'comparison' | 'category'`
- Each suggestion has "Crear en Notion" → `createTask()` in notion-service.ts