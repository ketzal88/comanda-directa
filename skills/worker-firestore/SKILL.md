---
name: worker-firestore
description: Use when reading from or writing to Firestore in the Worker Brain codebase. Covers the exact doc ID patterns, composite index patterns, batch/bulk write limits, ignoreUndefinedProperties behavior, and known performance gotchas. Auto-activates on any task touching db.collection(), db.batch(), BulkWriter, firestore.indexes.json, or when designing a new collection.
---

# Worker Brain — Firestore Patterns

Authoritative reference for every Firestore interaction. If this skill disagrees with ad-hoc code you find, trust this skill.

## Initialization

```ts
import { db } from "@/lib/firebase-admin";
// db is initialized with:  { ignoreUndefinedProperties: true }
```

This means:
- Passing objects with `undefined` fields is safe — they're stripped.
- It does NOT delete existing fields. Use `FieldValue.delete()`.
- `null` is stored as null. Never use null as a "delete me" sentinel.

## Doc ID conventions (four patterns)

| Pattern | Collections | Example |
|---|---|---|
| `{clientId}__{CHANNEL}__{YYYY-MM-DD}` | `channel_snapshots` | `abc123__META__2026-04-14` |
| `{clientId}__{entityId}` | `meta_creatives`, `creative_dna` | `abc123__120210...` |
| `{clientId}__{platform}__{customerId}` | `ecommerce_customers` | `abc123__shopify__456` |
| `{clientId}` | `client_snapshots`, `creative_diversity_scores` | `abc123` |

CHANNEL values: `META`, `GOOGLE`, `ECOMMERCE`, `EMAIL`, `LEADS` (uppercase).
Platform values: `shopify`, `tiendanube`, `woocommerce` (lowercase).

**Never invent new ID patterns.** New collections must reuse one of these four.

## Query cost cheat sheet

| Operation | Cost |
|---|---|
| `.doc(id).get()` | 1 read |
| `.where(...).limit(N).get()` | N reads (at most) |
| `.where(...).get()` (no limit) | **unbounded** — always limit |
| `db.getAll(...refs)` | 1 read per ref, single round-trip |
| `.set(obj)` | 1 write |
| `batch().set(...)` up to 500 | 1 write per op |
| BulkWriter | 1 write per op, best for >500 |

## Composite indexes

Every `where()` + `orderBy()` combo needs one. Add to `firestore.indexes.json`, deploy with:

```bash
firebase deploy --only firestore:indexes
```

Or use the `/deploy-indexes` command for a safe diff + deploy.

Common indexes already deployed (check file before adding):
- `leads` by `clientId`, `status`, `createdAt desc`
- `channel_snapshots` by `clientId`, `channel`, `date desc`
- `cron_executions` by `clientId`, `status`, `createdAt desc`

## Source detection (ecommerce + email)

Both `ECOMMERCE` and `EMAIL` channels union multiple platforms in one snapshot. Always detect via:

```ts
const source = snapshot.rawData?.source;
// ECOMMERCE: 'shopify' | 'tiendanube' | 'woocommerce'
// EMAIL: 'klaviyo' | 'perfit'
```

Never infer from clientId or hardcode.

## Batch writing patterns

```ts
// < 500 ops — use batch
const batch = db.batch();
for (const doc of docs) batch.set(db.collection('x').doc(doc.id), doc);
await batch.commit();

// > 500 ops — use BulkWriter (auto-chunks, handles backoff)
const bw = db.bulkWriter();
for (const doc of docs) bw.set(db.collection('x').doc(doc.id), doc);
await bw.close();
```

Backfill budget: **18K writes/run** (`backfill_progress/massive_2025_2026` tracks this).

## Common bugs (historical)

- **Silently failing query**: missing composite index. Check Vercel/server logs for the "create this index" link.
- **Ecommerce timezone double-count**: orders from shop timezone vs UTC overlap.
- **Klaviyo single-snapshot bug** (fixed): was writing one doc for the whole range instead of per-day.
- **Undefined-stripping confusion**: reading a doc with missing field returns `undefined`, which is fine — but writing `undefined` does NOT delete.

See `.claude/rules/firestore-conventions.md` for the condensed ruleset.