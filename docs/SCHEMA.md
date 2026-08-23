# VibeCheck — Shared JSON Schema

**Status: locked at Hour 0.** Any change to a shape below must be announced in the team
channel before it's pushed — this is the #1 source of Day 1 integration breakage.

This doc defines the three JSON shapes that pass between the three owned pieces:

```
prompt/code ──► [Aryan: checklist]         checklist.json
                        │
site/code ────► [Aalok: render+extract] ──► extraction.json
                        │                          │
                        └──────────► [Aryan: diff] ─┴──► diff.json ──► [Frontend: overlay UI]
```

Runnable copies of every shape below live in [`/schema`](../schema) as `.example.json`
files — treat those as the source of truth if this doc and the code ever disagree.

---

## 1. `checklist.json` — owned by Aryan (generated from prompt)

The expected-state spec, derived from the user's prompt via Claude API. This is what the
extraction gets diffed against.

```jsonc
{
  "checklistVersion": "1.0",
  "sourcePrompt": "email input, password input, blue submit button 24px below input",
  "elements": [
    {
      "id": "el-1",                     // stable id, referenced by diff.json
      "type": "button",                 // button | input | text | image | heading | container | link
      "role": "submit",                 // free-text semantic hint, optional
      "expected": {
        "text": "Sign in",              // optional — null if not spec'd
        "color": "#2563EB",             // optional hex, foreground/fill color
        "backgroundColor": "#2563EB",   // optional hex
        "position": {                   // optional — any sub-field may be omitted
          "relativeTo": "el-0",         // id of another element, or "viewport"
          "direction": "below",         // above | below | left-of | right-of | inside
          "offsetPx": 24
        },
        "size": {                       // optional
          "widthPx": 120,
          "heightPx": 40
        },
        "alignment": "center"           // left | center | right | null
      }
    }
  ]
}
```

Rules:
- `elements[].id` values must be unique within one checklist and are the join key used by
  both `extraction.json` (`matchedElementId`) and `diff.json` (`elementId`).
- Any `expected.*` field the prompt didn't specify is `null`/omitted — the diff engine
  must never invent a mismatch for a field that wasn't spec'd.
- Colors are always lowercase-agnostic 6-digit hex (`#RRGGBB`), no shorthand, no alpha.

---

## 2. `extraction.json` — owned by Aalok (rendered + measured)

The actual-state snapshot, produced by Playwright rendering the generated code headlessly
and reading `boundingClientRect` + `getComputedStyle` per element.

```jsonc
{
  "extractionVersion": "1.0",
  "screenshot": "data:image/png;base64,...",   // full-page screenshot, base64
  "viewport": { "width": 1280, "height": 800 },
  "elements": [
    {
      "id": "dom-1",                    // Aalok's own id, NOT the checklist id
      "tag": "button",
      "text": "Sign in",
      "boundingBox": {                  // raw boundingClientRect, px, viewport-relative
        "x": 240, "y": 188, "width": 118, "height": 41
      },
      "computedStyle": {                // only the subset the diff engine needs — keep small
        "color": "#ffffff",
        "backgroundColor": "#2563eb",
        "fontSize": "16px",
        "fontWeight": "600"
      },
      "attributes": {                   // for accessibility stretch goal — grab now, use later
        "alt": null,
        "ariaLabel": null,
        "role": null
      }
    }
  ]
}
```

Rules:
- `elements[].id` is Aalok's own DOM-assigned id (e.g. `dom-1`, `dom-2`, ...) — it does
  **not** need to match checklist ids. Matching checklist elements to extraction elements
  (by tag + text + position proximity) is diff-engine responsibility, not extraction
  responsibility. Keep extraction dumb: measure everything, decide nothing.
- `computedStyle` is intentionally a curated subset, not the full CSSStyleDeclaration —
  add a field only when the diff engine actually consumes it, to keep payloads small.
- `screenshot` is the thing the frontend overlays outlines on top of — box coordinates in
  `boundingBox` must be in the same pixel space as the screenshot (i.e. no viewport
  scaling applied after capture).

---

## 3. `diff.json` — owned by Aryan (checklist × extraction → verdict)

The comparison result. This is the only shape the frontend needs to render the results
screen — it should never have to look at checklist.json or extraction.json directly.

```jsonc
{
  "diffVersion": "1.0",
  "summary": {
    "totalChecked": 4,
    "mismatches": 2,
    "status": "mismatch"              // "match" | "mismatch" — for the one-line banner
  },
  "results": [
    {
      "elementId": "el-1",              // checklist element id — join key
      "matchedExtractionId": "dom-1",   // extraction element id, or null if MISSING
      "verdict": "match",               // match | position_mismatch | style_mismatch | missing
      "checks": [                       // per-field detail, only for fields checklist spec'd
        { "field": "backgroundColor", "expected": "#2563EB", "actual": "#2563eb", "pass": true },
        { "field": "position.offsetPx", "expected": 24, "actual": 41, "pass": false, "deltaPx": 17 }
      ],
      "boundingBox": { "x": 240, "y": 188, "width": 118, "height": 41 },  // for overlay draw, copied from extraction, null if missing
      "note": "Button is 17px lower than spec'd (24px expected)."         // one-line human summary for the overlay tooltip
    }
  ],
  "retry": {                            // present only after a retry pass has run
    "attempted": true,
    "previousDiffSummary": { "totalChecked": 4, "mismatches": 2 },
    "resultAfterRetry": { "totalChecked": 4, "mismatches": 1 }
  },
  "promptSuggestions": [                // optional — plain-English prompt-rewrite hints
    "For \"el-1\": specify the exact spacing as 24px."
  ]
}
```

Rules:
- `verdict: "missing"` ⇒ element wasn't found in extraction at all ⇒ render as **red**.
- `verdict: "position_mismatch"` or `"style_mismatch"` ⇒ found but off-spec ⇒ **yellow**.
- `verdict: "match"` ⇒ **green**. (Colors match the overlay spec in the execution plan.)
- Tolerances (position px tolerance, color delta tolerance) are diff-engine internal
  config, not part of this schema — document them in `checklist-diff/README.md`, tune
  freely without touching this file.
- `retry` block is only added by the diff engine on the second pass; frontend must treat
  its absence as "no retry has happened yet," not as an error.
- `promptSuggestions` is derived deterministically from `results[].checks` (see
  `backend/src/promptCoach.js`) — never a second AI call, so it can never suggest
  something the diff itself didn't actually find. Empty array (not omitted) when
  `summary.status === "match"`.

---

## Integration checkpoint (Day 1, Hour 10–11)

Before this checkpoint, each owner should be able to independently produce a file that
validates against their shape above using fake/stubbed data. At the checkpoint:

1. Aalok produces a real `extraction.json` from the agreed test case.
2. Aryan produces a real `checklist.json` from the same test case's prompt, and feeds
   both into the diff engine to produce a real `diff.json`.
3. Frontend loads that real `diff.json` into the results screen.

If any shape needed a field that isn't in this doc, add it here first, then in code —
never let a piece silently start emitting an undocumented field.
