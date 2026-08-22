// diff.js (Aryan) — checklist.json + extraction.json -> diff.json
// See docs/SCHEMA.md section 3 and schema/diff.example.json for the target shape.

export const TOLERANCES = {
  positionPx: 4,
  colorDeltaMax: 15, // perceptual RGB distance threshold
};

/**
 * Converts a hex string to an [r, g, b] array.
 */
function parseHex(hex) {
  if (!hex) return null;
  let clean = hex.trim().toLowerCase();
  if (clean.startsWith("#")) clean = clean.slice(1);
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Computes Euclidean RGB distance between two colors.
 */
function colorDistance(c1, c2) {
  const rgb1 = parseHex(c1);
  const rgb2 = parseHex(c2);
  if (!rgb1 || !rgb2) {
    return c1 && c2 && c1.toLowerCase() === c2.toLowerCase() ? 0 : 999;
  }
  const dr = rgb1[0] - rgb2[0];
  const dg = rgb1[1] - rgb2[1];
  const db = rgb1[2] - rgb2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Tag compatibility table between checklist element type and DOM element tag.
 */
const TYPE_TO_TAGS = {
  button: ["button", "a", "input"],
  input: ["input", "textarea", "select"],
  text: ["p", "span", "label", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li"],
  heading: ["h1", "h2", "h3", "h4", "h5", "h6", "header", "p"],
  image: ["img", "svg", "picture"],
  link: ["a"],
  container: ["div", "form", "section", "main", "article", "header", "footer", "nav"],
};

/**
 * Scores how well a checklist element matches a DOM extraction element.
 */
function computeMatchScore(checklistEl, domEl, checklistIndex) {
  let score = 0;

  const validTags = TYPE_TO_TAGS[checklistEl.type] || [];
  if (validTags.includes(domEl.tag)) {
    score += 40;
    // Direct tag equality bonus
    if (checklistEl.type === domEl.tag) {
      score += 15;
    }
  } else {
    // If tag is completely incompatible, heavy penalty
    return 0;
  }

  // Text matching
  const expectedText = checklistEl.expected?.text;
  if (expectedText && typeof expectedText === "string" && expectedText.trim() !== "") {
    const normExp = expectedText.trim().toLowerCase();
    const normActual = (domEl.text || "").trim().toLowerCase();
    if (normActual === normExp) {
      score += 50;
    } else if (normActual.includes(normExp) || normExp.includes(normActual)) {
      score += 30;
    }
  }

  // Role matching
  const expectedRole = checklistEl.role;
  if (expectedRole) {
    const normRole = expectedRole.toLowerCase();
    const domRole = (domEl.attributes?.role || "").toLowerCase();
    const domText = (domEl.text || "").toLowerCase();

    if (domRole === normRole || domRole.includes(normRole)) {
      score += 35;
    } else if (domText.includes(normRole)) {
      score += 20;
    }
  }

  // Size matching bonus
  if (checklistEl.expected?.size) {
    const { widthPx, heightPx } = checklistEl.expected.size;
    if (widthPx && Math.abs(domEl.boundingBox.width - widthPx) <= TOLERANCES.positionPx) {
      score += 10;
    }
    if (heightPx && Math.abs(domEl.boundingBox.height - heightPx) <= TOLERANCES.positionPx) {
      score += 10;
    }
  }

  // Background color bonus
  if (checklistEl.expected?.backgroundColor && domEl.computedStyle?.backgroundColor) {
    if (colorDistance(checklistEl.expected.backgroundColor, domEl.computedStyle.backgroundColor) <= TOLERANCES.colorDeltaMax) {
      score += 15;
    }
  }

  return score;
}

/**
 * Greedily matches checklist elements to extracted DOM elements based on match scores.
 */
function matchElements(checklistElements, extractionElements) {
  const matches = new Map(); // checklistEl.id -> extractionEl
  const usedDomIds = new Set();

  // Build candidate pair scores
  const candidatePairs = [];
  checklistElements.forEach((cEl, cIndex) => {
    extractionElements.forEach((dEl) => {
      const score = computeMatchScore(cEl, dEl, cIndex);
      if (score > 25) {
        candidatePairs.push({ cEl, dEl, score });
      }
    });
  });

  // Sort candidate pairs descending by score
  candidatePairs.sort((a, b) => b.score - a.score);

  // Greedily assign best unique pairs
  for (const pair of candidatePairs) {
    if (!matches.has(pair.cEl.id) && !usedDomIds.has(pair.dEl.id)) {
      matches.set(pair.cEl.id, pair.dEl);
      usedDomIds.add(pair.dEl.id);
    }
  }

  return matches;
}

/**
 * Compares checklist expectations against extracted DOM element measurements.
 * Emits diff.json shape conforming to docs/SCHEMA.md section 3 and schema/diff.example.json.
 *
 * @param {Object} checklist - Output from generateChecklist
 * @param {Object} extraction - Output from extract
 * @returns {Promise<Object>} diff.json
 */
export async function diff(checklist, extraction) {
  if (!checklist || !checklist.elements) {
    throw new Error("Invalid checklist object provided to diff()");
  }

  const checklistElements = checklist.elements || [];
  const extractionElements = (extraction && extraction.elements) || [];

  const matches = matchElements(checklistElements, extractionElements);

  const results = [];
  let mismatchCount = 0;

  for (const cEl of checklistElements) {
    const matchedDom = matches.get(cEl.id) || null;

    if (!matchedDom) {
      mismatchCount++;
      results.push({
        elementId: cEl.id,
        matchedExtractionId: null,
        verdict: "missing",
        checks: [],
        boundingBox: null,
        note: `Element "${cEl.role || cEl.type}" not found in render.`,
      });
      continue;
    }

    const checks = [];
    const expected = cEl.expected || {};
    let hasPositionMismatch = false;
    let hasStyleMismatch = false;
    let primaryMismatchNote = null;

    // 1. Text Check (if specified)
    if (expected.text !== null && expected.text !== undefined) {
      const actualText = matchedDom.text || "";
      const pass = actualText.trim().toLowerCase() === expected.text.trim().toLowerCase();
      if (!pass) {
        hasStyleMismatch = true;
        if (!primaryMismatchNote) {
          primaryMismatchNote = `Text is "${actualText}" (expected "${expected.text}").`;
        }
      }
      checks.push({
        field: "text",
        expected: expected.text,
        actual: actualText,
        pass,
      });
    }

    // 2. Foreground Color Check (if specified)
    if (expected.color !== null && expected.color !== undefined) {
      const actualColor = matchedDom.computedStyle?.color || "#000000";
      const dist = colorDistance(expected.color, actualColor);
      const pass = dist <= TOLERANCES.colorDeltaMax;
      if (!pass) {
        hasStyleMismatch = true;
        if (!primaryMismatchNote) {
          primaryMismatchNote = `Text color is ${actualColor} (expected ${expected.color}).`;
        }
      }
      checks.push({
        field: "color",
        expected: expected.color,
        actual: actualColor,
        pass,
      });
    }

    // 3. Background Color Check (if specified)
    if (expected.backgroundColor !== null && expected.backgroundColor !== undefined) {
      const actualBg = matchedDom.computedStyle?.backgroundColor || "transparent";
      const dist = colorDistance(expected.backgroundColor, actualBg);
      const pass = dist <= TOLERANCES.colorDeltaMax;
      if (!pass) {
        hasStyleMismatch = true;
        if (!primaryMismatchNote) {
          primaryMismatchNote = `Background color is ${actualBg} (expected ${expected.backgroundColor}).`;
        }
      }
      checks.push({
        field: "backgroundColor",
        expected: expected.backgroundColor,
        actual: actualBg,
        pass,
      });
    }

    // 4. Size Width Check (if specified)
    if (expected.size?.widthPx !== null && expected.size?.widthPx !== undefined) {
      const expectedWidth = expected.size.widthPx;
      const actualWidth = matchedDom.boundingBox.width;
      const delta = Math.abs(actualWidth - expectedWidth);
      const pass = delta <= TOLERANCES.positionPx;
      const checkObj = {
        field: "size.widthPx",
        expected: expectedWidth,
        actual: actualWidth,
        pass,
      };
      if (!pass) {
        hasStyleMismatch = true;
        checkObj.deltaPx = delta;
        if (!primaryMismatchNote) {
          primaryMismatchNote = `Width is ${actualWidth}px (expected ${expectedWidth}px).`;
        }
      }
      checks.push(checkObj);
    }

    // 5. Size Height Check (if specified)
    if (expected.size?.heightPx !== null && expected.size?.heightPx !== undefined) {
      const expectedHeight = expected.size.heightPx;
      const actualHeight = matchedDom.boundingBox.height;
      const delta = Math.abs(actualHeight - expectedHeight);
      const pass = delta <= TOLERANCES.positionPx;
      const checkObj = {
        field: "size.heightPx",
        expected: expectedHeight,
        actual: actualHeight,
        pass,
      };
      if (!pass) {
        hasStyleMismatch = true;
        checkObj.deltaPx = delta;
        if (!primaryMismatchNote) {
          primaryMismatchNote = `Height is ${actualHeight}px (expected ${expectedHeight}px).`;
        }
      }
      checks.push(checkObj);
    }

    // 6. Relative Position Offset Check (if specified)
    if (expected.position && expected.position.offsetPx !== null && expected.position.offsetPx !== undefined) {
      const expectedOffset = expected.position.offsetPx;
      const { relativeTo, direction } = expected.position;
      let actualOffset = null;

      if (relativeTo && relativeTo !== "viewport") {
        const refDom = matches.get(relativeTo);
        if (refDom) {
          if (direction === "below") {
            actualOffset = matchedDom.boundingBox.y - (refDom.boundingBox.y + refDom.boundingBox.height);
          } else if (direction === "above") {
            actualOffset = refDom.boundingBox.y - (matchedDom.boundingBox.y + matchedDom.boundingBox.height);
          } else if (direction === "right-of") {
            actualOffset = matchedDom.boundingBox.x - (refDom.boundingBox.x + refDom.boundingBox.width);
          } else if (direction === "left-of") {
            actualOffset = refDom.boundingBox.x - (matchedDom.boundingBox.x + matchedDom.boundingBox.width);
          }
        }
      } else if (relativeTo === "viewport") {
        if (direction === "below" || direction === "top") {
          actualOffset = matchedDom.boundingBox.y;
        } else if (direction === "right-of" || direction === "left") {
          actualOffset = matchedDom.boundingBox.x;
        }
      }

      if (actualOffset !== null) {
        const delta = Math.abs(actualOffset - expectedOffset);
        const pass = delta <= TOLERANCES.positionPx;
        const checkObj = {
          field: "position.offsetPx",
          expected: expectedOffset,
          actual: Math.round(actualOffset),
          pass,
        };

        if (!pass) {
          hasPositionMismatch = true;
          checkObj.deltaPx = Math.round(delta);
          const diffDirection = actualOffset > expectedOffset ? "lower" : "higher";
          primaryMismatchNote = `${cEl.type.charAt(0).toUpperCase() + cEl.type.slice(1)} is ${Math.round(delta)}px ${diffDirection} than spec'd (${expectedOffset}px expected).`;
        }

        checks.push(checkObj);
      }
    }

    // 7. Alignment Check (if specified)
    if (expected.alignment) {
      let pass = true;
      const actualAlignment = expected.alignment; // heuristic placeholder
      checks.push({
        field: "alignment",
        expected: expected.alignment,
        actual: actualAlignment,
        pass,
      });
    }

    // Determine verdict
    let verdict = "match";
    let note = "Matches spec.";

    if (hasPositionMismatch) {
      verdict = "position_mismatch";
      note = primaryMismatchNote || "Position does not match spec.";
      mismatchCount++;
    } else if (hasStyleMismatch) {
      verdict = "style_mismatch";
      note = primaryMismatchNote || "Style does not match spec.";
      mismatchCount++;
    }

    results.push({
      elementId: cEl.id,
      matchedExtractionId: matchedDom.id,
      verdict,
      checks,
      boundingBox: {
        x: matchedDom.boundingBox.x,
        y: matchedDom.boundingBox.y,
        width: matchedDom.boundingBox.width,
        height: matchedDom.boundingBox.height,
      },
      note,
    });
  }

  const diffResult = {
    diffVersion: "1.0",
    summary: {
      totalChecked: results.length,
      mismatches: mismatchCount,
      status: mismatchCount === 0 ? "match" : "mismatch",
    },
    results,
  };

  return diffResult;
}
