# VibeCheck — 72-Hour Execution Plan
### Hack With Dora 2.0 · Team of 4 · Category: Developer Tools

---

## Roles (locked)

| Person | Owns |
|---|---|
| **Aalok** (backend) | Render + extraction (Playwright, DOM measurement) |
| **Aryan** (AI/ML) | Checklist generation (Claude API) + diff engine |
| **You** (frontend) | Upload screen, results UI, side-by-side view — with Duchuu day 1–2, then hands off to Duchuu day 3 to move into pitch/launch |
| **Duchuu** (ramping up) | Frontend co-build with you, Kanban board owner, then full frontend ownership from day 3 while you shift to pitch |

**Why this split, not generic A/B/C/D:** Aalok's Playwright work is the closest match to backend skill and lowest-risk since your team has touched this pipeline before. Aryan owns the checklist + diff engine undivided — it's the most conceptually hard piece, so it stays with your strongest AI person end-to-end rather than being split. You and Duchuu build frontend together from hour 0 so she isn't alone on a scored deliverable (Usability & Design is 20% of the score) — by day 3, once she's ramped up on the codebase, she takes over frontend polish solo so you're freed to co-own the pitch with her, rather than trying to do both frontend and pitch writing at once under time pressure.

---

## Day 1 (Hours 0–24) — Build the skeleton, prove the pipeline works end-to-end on one case

**Goal for end of Day 1: one hardcoded example flows through the ENTIRE pipeline, even if ugly.** Not five polished features — one thread, fully connected. This is the highest-risk failure point (schema mismatches between pieces), so front-load it.

- **Hours 0–2 — Team sync**
  - Re-confirm the JSON schema ([`docs/SCHEMA.md`](SCHEMA.md)) — everyone commits to it, no one deviates without telling the group
  - Set up shared repo, Kanban board (Trello/GitHub Projects/Notion), Slack/Discord thread
  - Pick ONE simple test case to build the whole pipeline against first (e.g. "login page: email input, password input, blue submit button below") — do not pick anything ambitious for the first pass

- **Hours 2–10 — Parallel build, piece by piece**
  - Aalok: get Playwright rendering a sample AI-generated HTML/React page headlessly, extract `boundingClientRect` + `getComputedStyle` into the agreed JSON shape
  - Aryan: get Claude API turning the test prompt into the checklist JSON; stub the diff engine logic against fake data first. Once this is stable, wire the same API to also generate the actual code from the prompt (the agent-generation flow) — don't start this second half until checklist generation itself works
  - You + Duchuu: build the upload screen (prompt/image input + code input, plus the new prompt-to-agent option) and a placeholder results screen together — use this time to get Duchuu comfortable in the codebase, not just watching you work
  - You (floating pocket): once the upload screen skeleton is up, dip in to help Aalok or Aryan if either is blocked; also start drafting the pitch narrative early

- **Hours 10–11 — Mandatory integration checkpoint**
  - Pass real JSON between all three pieces for the one test case. This is where schema drift shows up — catch it now, not hour 60.

- **Hours 11–20 — Fix integration issues, get the full loop working on the test case**
  - Target: prompt in → checklist generated → code rendered → extracted → diffed → mismatch report shown on screen, for your one test case, ugly UI is fine

- **Hours 20–24 — Checkpoint + rest**
  - Confirm the full loop actually runs without you babysitting it
  - Log every known bug/gap on the Kanban board so nothing is lost overnight
  - Sleep.

---

## Day 2 (Hours 24–48) — Widen it, harden it, add the retry loop

**Goal for end of Day 2: works on 3–5 different test cases, retry loop works once, UI looks like a real product.**

- **Hours 24–34 — Generalize beyond the one test case**
  - Aalok: handle more element types (headings, images, forms), not just buttons/inputs
  - Aryan: improve checklist quality across varied prompts; tune the diff engine's thresholds (position tolerance, color tolerance) so it doesn't flag false positives on minor rendering noise
  - You + Duchuu: build out the real results UI — the mismatch overlay directly on the rendered screenshot (red/yellow/green outlines, one-line summary at top), not a JSON dump. Duchuu should be driving more of this by now, with you reviewing rather than building solo
  - You: split remaining time helping Aryan tune checklist/diff quality and start collecting screen recordings of working runs for later demo footage

- **Hours 34–40 — Build the single capped retry pass**
  - On mismatch → feed the specific mismatch report back to the AI → regenerate once → re-diff → show before/after

- **Hours 40–44 — Demo prompt validation**
  - Aryan drafts 2–3 candidate demo prompts using precise specs (exact hex colors, exact pixel positions/spacing)
  - Run each candidate 3–4 times to confirm it reliably produces a real, honest mismatch
  - You + Duchuu: once a validated prompt is confirmed, populate the pre-generated fallback gallery (2–3 guaranteed-good example runs)

- **Hours 44–48 — Stress test with messier, more realistic prompts, then checkpoint + rest**
  - Try prompts closer to what a real dev would type
  - Fix whatever breaks
  - Update Kanban, sleep again

---

## Day 3 (Hours 48–72) — Polish, pitch, launch

- **Hours 48–56 — Feature freeze, polish only**
  - No new features after hour 56
  - Aalok + Aryan: fix remaining bugs, smooth rough edges, bulletproof the happy path
  - Duchuu: full frontend polish ownership
  - You: hand off frontend, move fully into pitch deck + demo video script

- **Hours 56–62 — Record the demo video**
  - Show: prompt in → mismatch found → retry → fixed. Under 90 seconds.
  - Recorded demo + live Q&A backup, not live demo
  - Explicitly state differentiation from Percy/Chromatic/Applitools

- **Hours 62–68 — Launch on Product Hunt / Peerlist**
  - Write the launch post using the "why I hate X" personal framing
  - Get network to upvote/comment early

- **Hours 68–72 — Final pitch rehearsal + buffer**
  - Rehearse as a team, everyone can explain "why one AI step, not two"
  - Keep real buffer time

---

## Core Features

### 1. Agent-generated code flow (prompt → code → check, all on-site)
Ship with one agent only (Claude API). Dropdown UI with "more agents coming soon."
Owner: Aryan (generation call), Aalok supports (feeds generated code into render step).
Does NOT compromise the "one AI step" pitch claim — that's about the QA pipeline staying
deterministic; code generation is a separate upstream step.

### 2. Mismatch overlay on the rendered screenshot
Red = missing, yellow = wrong position/color, green = matched. One-line summary at top.
Owner: You + Duchuu (Day 2).

### 3. Demo prompt design + validation
Precise specs (exact hex, exact px) reliably produce real mismatches — that's the market.
Owner: Aryan drafts, team validates 3–4x each, Day 2 hours 40–44.
**Integrity note: never fabricate or pre-script a mismatch report — only choose good,
honest test inputs.**

### 4. Pre-generated fallback example gallery
2–3 pre-run examples, one-click fallback for the judged demo.
Owner: You + Duchuu, once overlay UI + validated prompts exist.

---

## Stretch Goal — Accessibility Checks

**Gate: do not start until the retry loop (Day 2, hours 34–40) is confirmed working.**

Computable from data already extracted (`getComputedStyle`, DOM structure):
- Missing/empty `alt` attributes on images
- Missing ARIA labels on interactive elements
- Basic color contrast check (text vs. background)

**Do NOT attempt:** keyboard nav testing, screen reader simulation, full WCAG audits.
Owner: Aryan, Day 2 hours ~40–46.
If not built: mention as a roadmap item in the pitch — zero build-hour cost.

---

## Non-negotiables

- Retry loop capped at 1 pass — never open-ended
- Structural/DOM diff stays primary; pixel diff stays optional/secondary
- Public GitHub repo + updated Kanban board + demo video are submission requirements
- Memorize the Percy/Chromatic/Applitools differentiation answer

## Pitch framing (Impact & Storytelling, 10%)

Open with: *"Everyone in this room just vibe-coded their project. VibeCheck is the tool
that checks whether the vibes actually rendered correctly."*

**Roadmap slide:** accessibility checks (if not shipped), then functional/logic
correctness and API behavior testing as the longer-term vision beyond visual QA.
