// promptCoach.js — turns diff mismatches into plain-English prompt-rewrite suggestions.
//
// Deliberately deterministic, not a second AI call: every suggestion is derived directly
// from checklist expected values that didn't match, so it can never say something the
// diff itself didn't find (same honesty rule as docs/demo-prompts.md — no fabricated
// mismatches, and no fabricated "fixes" either).
//
// Output is attached to diff.json as the optional `promptSuggestions` field —
// see docs/SCHEMA.md section 3.

const FIELD_LABELS = {
  text: "text",
  color: "text color",
  backgroundColor: "background color",
  "size.widthPx": "width",
  "size.heightPx": "height",
  "position.offsetPx": "spacing/position",
  alignment: "alignment",
};

/**
 * Builds one human-readable clause per failed check on a single mismatched element.
 */
function clausesForResult(result) {
  const clauses = [];

  if (result.verdict === "missing") {
    clauses.push(`Explicitly mention the missing element (e.g. name it and where it sits).`);
    return clauses;
  }

  for (const check of result.checks || []) {
    if (check.pass) continue;
    const label = FIELD_LABELS[check.field] || check.field;

    if (check.field === "backgroundColor" || check.field === "color") {
      clauses.push(`specify the exact ${label} as ${check.expected}`);
    } else if (check.field === "position.offsetPx") {
      clauses.push(`state the exact spacing as ${check.expected}px`);
    } else if (check.field === "size.widthPx" || check.field === "size.heightPx") {
      clauses.push(`state the exact ${label} as ${check.expected}px`);
    } else if (check.field === "text") {
      clauses.push(`use the exact text "${check.expected}"`);
    } else if (check.field === "alignment") {
      clauses.push(`specify alignment as "${check.expected}"`);
    } else {
      clauses.push(`be explicit about ${label} (expected ${check.expected})`);
    }
  }

  return clauses;
}

/**
 * Given a diff.json result, returns an array of short suggestion strings a user can
 * read to understand what their prompt under-specified. Returns [] when there's
 * nothing to suggest (e.g. everything matched).
 *
 * @param {Object} diffResult - output of diff() (backend/src/diff.js)
 * @returns {string[]}
 */
export function suggestPromptImprovements(diffResult) {
  const results = diffResult?.results || [];
  const suggestions = [];

  for (const result of results) {
    if (result.verdict === "match") continue;
    const clauses = clausesForResult(result);
    if (clauses.length === 0) continue;
    suggestions.push(`For "${result.elementId}": ${clauses.join(", ")}.`);
  }

  return suggestions;
}
