---
name: worker-cron
description: Use when creating, modifying, or debugging cron routes under /api/cron/** in the Worker Brain codebase. Covers validateCronSecret() auth, withErrorReporting() wrap, idempotency patterns, cron_executions logging, Vercel maxDuration limits, and GitHub Actions wiring. Auto-activates on any task touching src/app/api/cron/, .github/workflows/, or the CRON_SECRET env var.
---

# Worker Brain — Cron Patterns

Every cron is a public Vercel route. Treat it like an HTTP endpoint with auth, not like a scheduled job.

## The mandatory skeleton

```ts
// src/app/api/cron/<name>/route.ts
import { NextRequest } from 'next/server';
import { validateCronSecret } from '@/lib/cron-security';
import { withErrorReporting } from '@/lib/error-reporter';

export const maxDuration = 300;  // seconds; 300 is Vercel Pro max

export const POST = withErrorReporting('<name>', async (req: NextRequest) => {
  const auth = await validateCronSecret(req);
  if (!auth.valid) return auth.response;

  // ... handler logic

  return Response.json({ success: true });
});

export const GET = POST;  // optional — enables manual triggers via browser
```

## Auth

`validateCronSecret()` accepts two forms:
- `Authorization: Bearer <CRON_SECRET>` (GET-friendly, manual trigger from `/admin/cron`)
- `x-cron-secret: <CRON_SECRET>` header (POST from GitHub Actions)

Never accept unauthenticated POSTs. Never `if (process.env.NODE_ENV === 'development') skip auth`.

## Error handling

`withErrorReporting()` logs to `system_events` Firestore collection with structured metadata (cron name, args, stack trace). This surfaces in `/admin/system`.

Never:
- `console.error(e)` and swallow
- `catch (e) { return Response.json({ success: false }) }`
- Wrap only parts of the handler — wrap the whole thing

## Idempotency

All crons should be retry-safe:
- Deterministic doc IDs (`{clientId}__{CHANNEL}__{date}`)
- Upserts with `.set(x, { merge: true })`
- Log to `cron_executions` at start + end with status

```ts
await db.collection('cron_executions').doc().set({
  cronName: '<name>',
  clientId,
  startedAt: new Date().toISOString(),
  status: 'running',
});
```

## Timeout handling

Vercel Pro: 300s max. For longer jobs:

1. **Chunk it**: process N items per invocation, queue the rest.
   - See `channel_backfill_queue` + `process-backfill-queue` cron for the pattern.
2. **Split it**: separate routes per client or per channel.
3. **Async trigger**: never `await` a 10-minute job — fire a webhook / queue and return immediately.

If a cron consistently hits timeout, don't raise `maxDuration` — split the work.

## GitHub Actions schedule

The source of truth is `CLAUDE.md` → Cron Schedule table. When adding a new cron:

1. Add the route under `src/app/api/cron/<name>/route.ts`.
2. Add a workflow file in `.github/workflows/cron-<name>.yml`:

```yaml
name: Cron <name>
on:
  schedule:
    - cron: '15 10 * * *'  # UTC
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger
        run: |
          curl -X POST "${{ secrets.VERCEL_URL }}/api/cron/<name>" \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}" \
            --fail
```

3. Update `CLAUDE.md` → Cron Schedule table.
4. Set `CRON_SECRET` in GitHub repo secrets (same value as Vercel env).

## Observability

Every cron should write to:
- `cron_executions` — start/end/duration/status (consumed by `/admin/system`)
- `system_events` — errors (via `withErrorReporting`)

Use the `cron-health-doctor` agent to diagnose degradation patterns.

## Cron dependencies (run order matters)

```
09:00 sync-meta, sync-google, sync-ecommerce, sync-email   (raw data)
09:30 process-backfill-queue                                (fill gaps)
10:00 data-sync, sync-creatives, classify-entities, creative-dna  (derive)
10:15 morning-briefing                                      (consumer)
10:30 weekly-review (Mondays)
Day 2 monthly-report
Every 4h: account-health
```

A cron that depends on upstream data (e.g., briefing depends on sync-*) should check freshness and gracefully degrade if upstream failed.

See `.claude/rules/cron-security.md` for the condensed ruleset.