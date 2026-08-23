# Demo prompts (validate before recording the demo video)

Precise specs (exact hex, exact px) reliably produce real mismatches — AI code-gen is
good at rough layout, bad at exact values. That gap is the product's reason to exist.

**Rule: never fabricate or pre-script a mismatch. Only pick prompts that honestly and
reliably produce one when run through the real pipeline. Run each candidate 3–4 times
before relying on it.**

## Candidate 1

```
Login page with an email input and a password input stacked vertically, 16px gap
between them. Below the password input, a submit button: background #2563EB, white
text "Sign in", 120px wide, 40px tall, centered horizontally, 24px below the password
input.
```

- [ ] Run 1: mismatch found? _____
- [ ] Run 2: mismatch found? _____
- [ ] Run 3: mismatch found? _____
- [ ] Run 4: mismatch found? _____
- Reliable? Y/N — notes:

## Candidate 2

```
(fill in after candidate 1 validation — vary element type, e.g. a card with a heading
and an image, exact color + exact spacing)
```

- [ ] Run 1: _____
- [ ] Run 2: _____
- [ ] Run 3: _____
- [ ] Run 4: _____
- Reliable? Y/N — notes:

## Candidate 3

```
(fill in — keep as backup in case candidate 1/2 turn out to match perfectly too often)
```

- [ ] Run 1: _____
- [ ] Run 2: _____
- [ ] Run 3: _____
- [ ] Run 4: _____
- Reliable? Y/N — notes:

## Selected for demo

_Fill in once validated — this is the prompt used for both the live "watch it work" flex
and the pre-generated fallback gallery (`frontend/src/lib/sampleFixtures.js` /
`fixtures/demo-gallery`)._
