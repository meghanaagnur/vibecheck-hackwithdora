# frontend (You + Duchuu)

Upload screen, results/overlay UI, side-by-side view.

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Structure

```
src/
  pages/
    UploadPage        prompt/image input + code input + "generate via agent" option
    ResultsPage        mismatch overlay on the rendered screenshot + summary banner
  components/
    OverlayCanvas       draws red/yellow/green boxes from diff.json onto the screenshot
    SummaryBanner        "4 elements checked, 2 mismatches, 1 fixed after retry"
    RetryBeforeAfter      side-by-side diff.json before/after a retry pass
    FallbackGallery       pre-generated demo runs, one-click load
  lib/
    api.js               calls into services/render-extract + services/checklist-diff
    types.js              JS types mirroring docs/SCHEMA.md — keep in sync by hand
```

## Contract

The results UI consumes exactly one shape: `diff.json`
([schema](../docs/SCHEMA.md#3-diffjson--owned-by-aryan-checklist--extraction--verdict)).
It should never need to read `checklist.json` or `extraction.json` directly — if it does,
that's a sign a field is missing from `diff.json` and belongs in `docs/SCHEMA.md` first.

## Day 1 target

Upload screen + placeholder results screen up by hour 10 (integration checkpoint), wired
to real `diff.json` by end of Day 1.
