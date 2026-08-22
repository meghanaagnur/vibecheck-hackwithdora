# VibeCheck

QA for vibe-coded output. Prompt in → checklist generated → code rendered → extracted →
diffed against spec → mismatches shown on the actual screenshot, not a JSON dump.

Built at Hack With Dora 2.0 (72-hour hackathon).

## Repo layout

```
/schema                    Locked shared JSON shapes — see docs/SCHEMA.md
/docs
  SCHEMA.md                 The JSON contract between all three pieces (READ FIRST)
  EXECUTION_PLAN.md          72-hour plan, roles, hour-by-hour breakdown
/services
  render-extract/            Aalok — Playwright render + DOM measurement -> extraction.json
  checklist-diff/             Aryan — Claude API checklist gen, code-gen agent, diff engine
/frontend                    You + Duchuu — upload screen, results/overlay UI
/fixtures
  test-cases/                 Golden test case(s) used for Day 1 integration + Day 2 stress
  demo-gallery/                Pre-generated fallback runs for the live demo
```

## Getting started

Each service/app has its own README with setup steps. Start with
[`docs/SCHEMA.md`](docs/SCHEMA.md) — every piece reads/writes those shapes, so it's the
one doc the whole team needs before writing code.

## Team

| Person | Owns |
|---|---|
| Aalok | `services/render-extract` |
| Aryan | `services/checklist-diff` |
| You | `frontend` (Day 1–2), pitch/launch (Day 3) |
| Duchuu | `frontend` (co-build Day 1–2, full ownership Day 3) |
