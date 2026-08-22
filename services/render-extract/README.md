# render-extract (Aalok)

Takes generated HTML/React code, renders it headlessly with Playwright, and extracts
element geometry + computed style into `extraction.json` (shape defined in
[`docs/SCHEMA.md`](../../docs/SCHEMA.md#2-extractionjson--owned-by-aalok-rendered--measured)).

## Setup

```bash
cd services/render-extract
npm install
npx playwright install chromium
```

## Dev loop

1. Point at a test case in `/fixtures/test-cases`.
2. Render it headlessly (viewport size fixed — see schema doc).
3. Walk the DOM, pull `boundingClientRect()` + a curated `getComputedStyle()` subset per
   element, plus a full-page screenshot.
4. Write out `extraction.json` matching the schema exactly — validate against
   `/schema/extraction.example.json` before handing off.

## Day 1 target

One test case in, one valid `extraction.json` out, by hour 10 (integration checkpoint).
