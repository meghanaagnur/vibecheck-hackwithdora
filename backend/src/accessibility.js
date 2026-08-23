// accessibility.js — static a11y checks computed from data extract.js already pulls.
// Scope kept deliberately small per docs/EXECUTION_PLAN.md's stretch-goal gate:
//   - missing/empty alt text on images
//   - missing accessible name on interactive elements (button/link/input with no
//     visible text and no aria-label)
//   - basic color contrast (text vs background) using WCAG's relative-luminance formula
// Explicitly NOT attempted: keyboard nav testing, screen reader simulation, full
// WCAG audits — those need real interaction, not static extraction.
//
// Output is attached to diff.json as the optional `accessibilityIssues` field —
// see docs/SCHEMA.md section 3.

const INTERACTIVE_TAGS = new Set(["button", "a", "input", "select", "textarea"]);
const CONTRAST_THRESHOLD_AA = 4.5; // WCAG AA, normal-size text

function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return null;
  let clean = hex.trim().toLowerCase();
  if (clean === "transparent") return null;
  if (clean.startsWith("#")) clean = clean.slice(1);
  if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return null;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]) {
  const [rl, gl, bl] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/**
 * WCAG contrast ratio between two hex colors, or null if either isn't resolvable
 * (e.g. a genuinely transparent background over an unknown page color).
 */
function contrastRatio(hexA, hexB) {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return null;
  const lA = relativeLuminance(rgbA);
  const lB = relativeLuminance(rgbB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Runs static accessibility checks against an extraction.json's elements.
 * @param {Object} extraction - output of extract() (backend/src/extract.js)
 * @returns {Array<{elementId: string, tag: string, issue: string, severity: string, message: string}>}
 */
export function runAccessibilityChecks(extraction) {
  const elements = extraction?.elements || [];
  const issues = [];

  for (const el of elements) {
    const tag = el.tag;
    const text = (el.text || "").trim();
    const ariaLabel = (el.attributes?.ariaLabel || "").trim();
    const alt = el.attributes?.alt;

    // 1. Missing/empty alt text on images
    if (tag === "img" && (!alt || alt.trim() === "")) {
      issues.push({
        elementId: el.id,
        tag,
        issue: "missing-alt",
        severity: "error",
        message: "Image has no alt text — screen readers can't describe it.",
      });
    }

    // 2. Missing accessible name on interactive elements
    if (INTERACTIVE_TAGS.has(tag) && !text && !ariaLabel) {
      issues.push({
        elementId: el.id,
        tag,
        issue: "missing-accessible-name",
        severity: "error",
        message: `${tag} has no visible text and no aria-label — screen readers can't announce what it does.`,
      });
    }

    // 3. Basic color contrast (text vs background)
    const ratio = contrastRatio(el.computedStyle?.color, el.computedStyle?.backgroundColor);
    if (ratio !== null && ratio < CONTRAST_THRESHOLD_AA) {
      issues.push({
        elementId: el.id,
        tag,
        issue: "low-contrast",
        severity: "warning",
        message: `Text/background contrast is ${ratio.toFixed(2)}:1, below the ${CONTRAST_THRESHOLD_AA}:1 WCAG AA minimum for normal text.`,
      });
    }
  }

  return issues;
}
