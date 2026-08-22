# Demo gallery (fallback for live demo)

2–3 pre-run examples, populated Day 2 hours 40–44 once a demo prompt is validated
(see `services/checklist-diff/prompts/demo-prompts.md`).

Each entry: `<name>/checklist.json`, `<name>/extraction.json`, `<name>/diff.json`
(+ screenshot, embedded in extraction.json already). Frontend's `FallbackGallery`
component lists these for one-click loading during the judged demo.
