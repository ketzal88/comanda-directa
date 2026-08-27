---
name: worker-slack-formatting
description: Use when composing Slack messages in the Worker Brain codebase — digests (morning briefing, weekly review, monthly report), alerts, AI Analyst replies, or any SlackService call. Covers blocks API, threaded replies via thread_ts, anti-noise limits, emoji conventions, and the hybrid text/blocks payload. Auto-activates on any task touching src/lib/slack-service.ts, src/lib/digests/, or posting to Slack.
---

# Worker Brain — Slack Formatting

Clients subscribe to a **strict anti-noise budget**: 1 main msg/day + fires + 1 weekly + 1 monthly. Every Slack message must be designed with that in mind.

## The budget

| Cadence | Cron | Max items |
|---|---|---|
| Morning briefing (daily) | `morning-briefing` | 1 main msg + up to N thread replies |
| Fire alerts (CRITICAL) | `morning-briefing` | Inside the morning briefing thread |
| Weekly review (Mon) | `weekly-review` | 1 main msg + 1 thread reply per channel |
| Monthly report (Day 2) | `monthly-report` | 1 main msg + thread with details |
| AI Analyst replies | user @mention | On-demand only |

Never post outside this schedule without user approval.

## The builder pattern

All digests are **pure functions** (see `.claude/rules/alert-engine-pattern.md`):

```ts
// src/lib/digests/
buildMorningBriefing(clientId: string): Promise<{ main: SlackPayload; thread: SlackPayload[] }>
buildWeeklyReview(clientId: string): Promise<...>
buildMonthlyReport(clientId: string): Promise<...>
```

Builders return payloads. `SlackService` posts them. Use `/slack-preview` to dry-run.

## Thread pattern

```ts
const { ts } = await slackService.postMessage({ channel, ...mainPayload });
for (const reply of threadReplies) {
  await slackService.postMessage({ channel, thread_ts: ts, ...reply });
}
```

Use this for:
- Morning briefing → action items as thread replies
- Weekly review → per-channel detail as thread replies
- AI Analyst → conversation continuity

## Blocks structure

Prefer Blocks over `text` for structure. Always include a `text` fallback for push notifications.

```ts
{
  text: "🔔 Briefing del día — Cliente X",   // push notification preview
  blocks: [
    { type: "header", text: { type: "plain_text", text: "..." } },
    { type: "section", text: { type: "mrkdwn", text: "..." } },
    { type: "divider" },
    { type: "context", elements: [{ type: "mrkdwn", text: "_footnote_" }] },
  ],
}
```

**Never** use `:emoji:` shortcodes in `plain_text` — they render literal. Use Unicode emoji.

## Emoji conventions (Worker Brain style)

- 🔥 fire / critical / immediate action
- ⚠️ warning / degradation
- 📊 data / metric
- 🎯 target / objective met
- 🚀 scaling / growth opportunity
- 💡 insight / recommendation
- ✅ success / healthy
- 🔴🟡🟢 semáforo status
- 📅 schedule / timing

Don't over-use. A single header emoji is enough.

## Action items budget

Morning briefing: **max 3 action items**, each <20 words, actionable verb-first:
- ✅ "Subí presupuesto de adset Y a $50/día"
- ❌ "Deberías considerar aumentar el presupuesto"

Weekly review: **max 3 focus recommendations**, same format.

## Length limits

- Main message: aim for <10 lines rendered
- Thread reply: <20 lines
- Never a wall of text. If it's long, summarize + link to dashboard.

## Client channel routing

Each client has `slackChannelId` in their `clients` doc. Fallback to a default "unassigned" channel only for system-level errors.

Never hardcode channel IDs in code.

## Files to know

- `src/lib/slack-service.ts` — posting + formatting helpers
- `src/lib/digests/` — pure builders for the 3 digests
- `src/app/api/slack/events/route.ts` — AI Analyst @mention handler
- `SLACK_BOT_TOKEN` + `SLACK_SIGNING_SECRET` env vars

## Don't

- Post on weekends (unless user opted in)
- Post multiple times per day outside the briefing cadence
- Copy-paste data from dashboard — summarize + link
- Send error stack traces to client channels — log to `system_events` instead