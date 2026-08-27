---
name: meta-campaign-builder
description: Use when creating Meta Ads campaigns — via the Marketing API directly or via Meta's official MCP connector. Covers the mandatory spec-and-verify protocol (resolve IDs, confirm, execute, read-back diff) plus conversions (Schedule, Purchase), WhatsApp and lead campaigns with all required API parameters and known error fixes.
---

# Meta Campaign Builder via API

## Overview

Step-by-step script pattern for creating complete Meta Ads campaigns via the Marketing API v18+. Covers the full hierarchy: Campaign → Ad Set → Ad Creative → Ad.

**Base URL:** `https://graph.facebook.com/v18.0`
**Access token:** from `process.env.META_ACCESS_TOKEN`

---

## ⚠️ Antes de crear nada — protocolo de spec

**Este archivo es el ejecutor, no el que decide.** Lanzarse a crear resolviendo IDs y escribiendo copies sobre la marcha ya falló: píxel equivocado y copies fuera de política, campaña duplicada y corregida a mano.

Cuatro pasos, en orden, sin saltear:

1. **Resolver IDs** — ad account, píxel, evento, page, audiencias, creativos. El **ad account** se lee del cliente del cwd, nunca de la lista del connector: el BM de Worker ve las 31 cuentas. El **píxel** sale de la cadena: único activo → el que se llama como el cliente → el vinculado a la cuenta → `pixelId` del Brain → preguntar. El **evento** se verifica aparte aunque el píxel sea obvio: es donde más se falla.
2. **Copies desde un deliverable aprobado** — nunca escribir copy en el mismo turno que se arma la campaña. Si no existe el deck, correr [`ad-copy-deck`](../ad-copy-deck/SKILL.md) primero.
3. **Spec confirmada** — todo en un deliverable del cliente. Píxel+evento, copies, presupuesto+puja y audiencia+placements son los cuatro bloqueantes: no se crea nada hasta que estén los cuatro tildados.
4. **Read-back diff** — después de crear, releer de Meta lo que quedó y compararlo campo por campo contra la spec.

Template, tabla de read-back y reglas de desambiguación del píxel: [`references/campaign-spec.md`](references/campaign-spec.md).

Aplica igual por Marketing API o por el MCP oficial (`mcp.facebook.com/ads`). Cambia el ejecutor, no el protocolo.

---

## Critical API Helper Pattern

```typescript
async function api(path: string, method: 'GET' | 'POST' = 'GET', body?: Record<string, any>) {
  const url = `${BASE_URL}${path}`

  if (method === 'GET') {
    // ⚠️ Use & if path already has ? — never double ?
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

---

## Step 1 — Get Page ID

`/me/accounts` often returns empty for system user tokens. Use business-level lookup:

```typescript
// Find business ID
const biz = await api('/me/businesses?fields=id,name')
const workerBiz = biz.data.find(b => b.name.includes('Worker'))

// Get pages from business
const pages = await api(`/${workerBiz.id}/owned_pages?fields=id,name`)
const pageId = pages.data[0].id
```

---

## Step 2 — Fetch Assets from Ad Account

Assets MUST be in the **specific ad account** (`act_XXXXX`), NOT the Business Asset Library. The Business Asset Library API is not accessible with standard tokens.

```typescript
// Videos — match by title (filename without extension)
const videos = await api(`/${AD_ACCOUNT}/advideos?fields=id,title&limit=200`)

// Images — use hash for creatives
const images = await api(`/${AD_ACCOUNT}/adimages?fields=hash,name&limit=200`)

// Normalize matching
const norm = (s: string) => s.replace(/\.[^.]+$/, '').toLowerCase().trim()
const findVideo = (search: string) =>
  videos.data.find(v => norm(v.title).includes(norm(search)) || norm(search).includes(norm(v.title)))?.id
```

> ⚠️ If the library shows 0 results: the user uploaded to Business Asset Library instead of the ad account. They need to upload to **Ads Manager → Media Library** for the specific account.

---

## Step 3 — Create Campaign

| Objective | API Value | Use For |
|---|---|---|
| Conversions (sales/schedule) | `OUTCOME_SALES` | Purchase, Schedule pixel events |
| Leads | `OUTCOME_LEADS` | Lead gen, appointment booking |
| WhatsApp / Messaging | `OUTCOME_ENGAGEMENT` | WhatsApp click-to-chat |
| Traffic | `OUTCOME_TRAFFIC` | Link clicks |
| Awareness | `OUTCOME_AWARENESS` | Reach, brand |

```typescript
const campaign = await api(`/${AD_ACCOUNT}/campaigns`, 'POST', {
  name: 'Campaign Name',
  objective: 'OUTCOME_SALES',   // see table above
  status: 'PAUSED',
  buying_type: 'AUCTION',
  special_ad_categories: [],
})
```

---

## Step 4 — Create Ad Sets

### ⚠️ Required fields (missing any = Invalid parameter)

| Field | Value | Notes |
|---|---|---|
| `bid_strategy` | `LOWEST_COST_WITHOUT_CAP` | Always required — no auto-default |
| `targeting_automation` | `{ advantage_audience: 0 }` | Must be INSIDE targeting object |
| `facebook_positions` | `['feed', 'story', 'facebook_reels']` | Use `facebook_reels`, NOT `reels` |
| `instagram_positions` | `['stream', 'story', 'reels']` | `reels` is valid here |
| `billing_event` | `IMPRESSIONS` | Standard for all conversion objectives |
| `daily_budget` | cents/centavos | $30 USD = 3000 |

### Conversion event mapping

| Event | `custom_event_type` | `optimization_goal` |
|---|---|---|
| Purchase | `PURCHASE` | `OFFSITE_CONVERSIONS` |
| Schedule / Reserva | `SCHEDULE` | `OFFSITE_CONVERSIONS` |
| Lead | `LEAD` | `OFFSITE_CONVERSIONS` |
| WhatsApp | _(no promoted_object)_ | `CONVERSATIONS` |

### Cold ad set (interests)

```typescript
const coldAdSet = await api(`/${AD_ACCOUNT}/adsets`, 'POST', {
  name: 'Frío — S1',
  campaign_id: campaignId,
  daily_budget: 3000,
  billing_event: 'IMPRESSIONS',
  optimization_goal: 'OFFSITE_CONVERSIONS',
  bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
  promoted_object: {
    pixel_id: PIXEL_ID,
    custom_event_type: 'SCHEDULE',  // or PURCHASE, LEAD
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

### WhatsApp ad set

```typescript
const waAdSet = await api(`/${AD_ACCOUNT}/adsets`, 'POST', {
  name: 'WhatsApp — Frío',
  campaign_id: campaignId,
  daily_budget: 3000,
  billing_event: 'IMPRESSIONS',
  optimization_goal: 'CONVERSATIONS',
  bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
  // No promoted_object for WhatsApp
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

### Retargeting ad set (custom audience)

```typescript
const rtgAdSet = await api(`/${AD_ACCOUNT}/adsets`, 'POST', {
  name: 'Retargeting — Video Views 25%',
  campaign_id: campaignId,
  daily_budget: 700,
  billing_event: 'IMPRESSIONS',
  optimization_goal: 'OFFSITE_CONVERSIONS',
  bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
  promoted_object: { pixel_id: PIXEL_ID, custom_event_type: 'SCHEDULE' },
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

---

## Step 5 — Create Custom Audiences

### Video views 25%+

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

> ⚠️ Video sources must belong to the SAME ad account as the audience. Cross-account video IDs will fail with "Invalid parameter".

### Website visitors (pixel)

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

---

## Step 6 — Create Ad Creatives

### Video creative

⚠️ Thumbnail is **required** (`image_url` or `image_hash`). Fetch from video:

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
        type: 'BOOK_TRAVEL',  // or SHOP_NOW, LEARN_MORE, SEND_MESSAGE
        value: { link: destinationUrl },
      },
    },
  },
})
```

### Image creative

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
        type: 'BOOK_TRAVEL',
        value: { link: destinationUrl },
      },
    },
  },
})
```

### WhatsApp creative

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

---

## Step 7 — Create Ads

```typescript
const ad = await api(`/${AD_ACCOUNT}/ads`, 'POST', {
  name: adName,
  adset_id: adSetId,
  creative: { creative_id: creativeId },
  status: 'PAUSED',
})
```

---

## UTM Pattern

Estandar Worker completo (excepciones por cliente, reglas de nombres, Google Ads):
[`docs/utm-standard.md`](../../docs/utm-standard.md).

Va en `url_tags` del creative — el mismo campo que "Parametros de URL" a nivel anuncio en
la UI. Meta sustituye los `{{...}}` al click. No concatenar UTMs a la URL en codigo:
hardcodea el nombre de la campana y el reporte se rompe al renombrarla.

```typescript
const UTM = 'utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.name}}'
  + '&utm_id={{campaign.id}}&utm_content={{ad.name}}&utm_term={{adset.name}}'

const creative = await api(`/${AD_ACCOUNT}/adcreatives`, 'POST', {
  name: creativeName,
  url_tags: UTM,          // sin el ? adelante
  object_story_spec: { /* ... */ },
})
// Nombres de campana/adset/anuncio: lowercase, guiones, sin # & ? % ni emojis.
// Meta los sustituye crudos, sin encodear — un # trunca la URL entera.
// ad1-no-tenes-empresa, e1-mentalidad-frio
```

`utm_source=facebook`, nunca `meta`: `meta` no esta en la lista de sitios sociales de GA4 y
el trafico cae en Paid Other en vez de Paid Social.

---

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

---

## Error Quick Reference

| Error | Cause | Fix |
|---|---|---|
| `Se requiere la marca de público Advantage` | Missing `targeting_automation` | Add `targeting_automation: { advantage_audience: 0 }` INSIDE targeting |
| `Se requiere importe o puja` | Missing `bid_strategy` | Add `bid_strategy: 'LOWEST_COST_WITHOUT_CAP'` |
| `Posición en Facebook no válida: reels` | Wrong placement name | Use `facebook_reels` not `reels` in `facebook_positions` |
| `El anuncio necesita la miniatura` | No thumbnail in video creative | Add `image_url: thumb.picture` to `video_data` |
| `Syntax error "Expected end of string instead of ?"` | Double `?` in GET URL | Use `url.includes('?') ? '&' : '?'` separator |
| `Invalid parameter` (audience) | Cross-account video source | Videos must be in same account as audience |
| `No pages found` | `promote_pages` fails | Use `/me/businesses` → `/owned_pages` |
