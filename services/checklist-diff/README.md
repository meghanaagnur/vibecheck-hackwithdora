# checklist-diff (Aryan)

Two responsibilities, built in this order:

1. **Checklist generation** — Claude API turns a prompt into `checklist.json`
   ([schema](../../docs/SCHEMA.md#1-checklistjson--owned-by-aryan-generated-from-prompt)).
   Get this working and stable against fake extraction data first.
2. **Diff engine** — takes `checklist.json` + `extraction.json`, matches elements
   (by tag + text + position proximity — extraction ids do NOT match checklist ids),
   compares each spec'd field, and emits `diff.json`
   ([schema](../../docs/SCHEMA.md#3-diffjson--owned-by-aryan-checklist--extraction--verdict)).

Once (1) is stable, also wire:

3. **Code-gen agent** — same Claude API integration, prompt → actual HTML/React code,
   fed into `services/render-extract`. This is the "agent-generated code" flow from the
   execution plan. Don't start this until checklist generation itself works.

4. **Retry pass** — on mismatch, feed the diff's `note`/`checks` back into the code-gen
   call, regenerate once (capped — never loop), re-diff, return both diffs so the
   frontend can show before/after.

## Setup

```bash
cd services/checklist-diff
npm install
# set ANTHROPIC_API_KEY in .env (see .env.example)
```

## Tuning

Diff thresholds (position px tolerance, color delta tolerance) are internal config, not
part of the shared schema — tune freely in `src/diff.js`, document defaults here once set.

## Demo prompts

Validated demo prompts (exact hex/px specs, Day 2 hours 40–44) live in
`prompts/demo-prompts.md`. Never fabricate a mismatch — only choose inputs that reliably
produce a real one.
