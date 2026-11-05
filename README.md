# SaaS Command Center

**Live demo:** https://fde-dashboard-orpin.vercel.app

A Next.js analytics dashboard with two Claude features on top: a plain-English question box that streams answers as they're generated, and insight cards generated on the server and cached. All the data belongs to Nimbus Cloud, a fictional company, and comes from a static file.

## How it works

| Feature | Route | Behavior |
| ------- | ----- | -------- |
| Ask Your Data | `POST /api/query` | Streams Claude's answer as plain text, with the sample data in the system prompt. |
| AI Insights | `GET /api/insights` | Generates four insights, validates them, and caches them for an hour per server instance. |

KPI cards derive from the same series as the charts wherever a series exists (`lib/mockData.ts`), so a card can't disagree with its chart.

## Which engine answers

Every response says who wrote it, in the `engine` field or the `X-Engine` header, and the UI shows it.

| Situation | Who answers |
| --------- | ----------- |
| API key set, under the daily limit | Claude |
| No API key | Rules over the sample data |
| Daily limit reached | Rules, with no API call |
| API error, refusal, or unusable reply, before any text has streamed | Rules |
| The same failure after text has streamed | Claude's partial answer, marked as incomplete |

The streaming route waits for Claude's first text before responding, which is what makes a clean fallback possible and keeps the header truthful. If a visitor leaves mid-answer, the request to Claude is aborted.

The rule-based answers are computed from the data and only cover fixed topics: revenue, churn, usage, segments, and accounts. They say so when a question falls outside those.

## Configuration

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `ANTHROPIC_API_KEY` | none | Turns on Claude. |
| `CLAUDE_MODEL` | `claude-haiku-4-5-20251001` | Model to use. |
| `CLAUDE_DAILY_LIMIT` | `200` | Claude calls per UTC day. Counted per server instance and reset on a cold start, so also set a spending limit on the key. |

## Run it

```bash
npm install
cp .env.example .env.local   # optional: add a key to use Claude
npm run dev                  # http://localhost:3000
```

## Test

```bash
npm test
npm run lint && npm run typecheck && npm run build
```

The tests need no API key. They run the real Anthropic SDK and the real route handlers against a local fake of the Messages API, covering streaming, each fallback path, partial answers, caching, and input validation. That shows the app handles the API as modeled in the fake. It doesn't replace a check against the live API.
