// diff.js (Aryan) — checklist.json + extraction.json -> diff.json
// See docs/SCHEMA.md section 3 and schema/diff.example.json for the target shape.
//
// Tolerances below are internal tuning knobs, NOT part of the shared schema — adjust
// freely as you validate against real renders (Day 2, hours 24-34).
export const TOLERANCES = {
  positionPx: 4,
  colorDeltaMax: 10, // rough perceptual distance threshold, tune empirically
};

export async function diff(/* checklist, extraction */) {
  throw new Error("TODO: match checklist elements to extraction elements, compare fields, emit diff.json");
}
