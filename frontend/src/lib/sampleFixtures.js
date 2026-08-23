// Sample fixture data for demo / test runs when backend is in development or offline
import sampleDiffJson from "../../../schema/diff.example.json";

// A clean mockup SVG screenshot for demo visualization
const SAMPLE_SCREENSHOT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="100%" height="100%" fill="#0f172a"/>
  <!-- Browser Chrome Mockup -->
  <rect width="100%" height="40" fill="#1e293b"/>
  <circle cx="24" cy="20" r="6" fill="#ef4444"/>
  <circle cx="44" cy="20" r="6" fill="#f59e0b"/>
  <circle cx="64" cy="20" r="6" fill="#10b981"/>
  <rect x="100" y="8" width="600" height="24" rx="4" fill="#0f172a"/>
  <text x="110" y="24" fill="#64748b" font-family="sans-serif" font-size="12">https://app.preview/login</text>
  
  <!-- Content Mockup -->
  <rect x="200" y="70" width="400" height="380" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="240" y="110" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="20">Sign in to your account</text>
  
  <!-- Email Input (x: 240, y: 120, w: 300, h: 40) -->
  <rect x="240" y="130" width="320" height="40" rx="6" fill="#0f172a" stroke="#475569" stroke-width="1"/>
  <text x="252" y="155" fill="#94a3b8" font-family="sans-serif" font-size="14">name@example.com</text>
  
  <!-- Password Input (x: 240, y: 186, w: 320, h: 40) -->
  <rect x="240" y="186" width="320" height="40" rx="6" fill="#0f172a" stroke="#475569" stroke-width="1"/>
  <text x="252" y="211" fill="#94a3b8" font-family="sans-serif" font-size="14">••••••••••••</text>
  
  <!-- Submit Button (x: 240, y: 250, w: 120, h: 40) -->
  <rect x="240" y="250" width="120" height="40" rx="6" fill="#2563eb"/>
  <text x="275" y="275" fill="#ffffff" font-family="sans-serif" font-weight="600" font-size="14">Sign in</text>
</svg>
`)}`;

export const SAMPLE_DIFF = {
  ...sampleDiffJson,
  screenshot: SAMPLE_SCREENSHOT_SVG,
  sourcePrompt: "Login page with an email input and a password input stacked vertically, 16px gap between them. Below the password input, a submit button: background #2563EB, white text 'Sign in', 120px wide, 40px tall, centered horizontally, 24px below the password input.",
  results: [
    {
      elementId: "el0",
      matchedExtractionId: "dom1",
      verdict: "match",
      checks: [
        { field: "type", expected: "input", actual: "input", pass: true },
        { field: "position.widthPx", expected: 320, actual: 320, pass: true }
      ],
      boundingBox: { x: 240, y: 130, width: 320, height: 40 },
      note: "Email input matches specification."
    },
    {
      elementId: "el1",
      matchedExtractionId: "dom2",
      verdict: "match",
      checks: [
        { field: "type", expected: "input", actual: "input", pass: true }
      ],
      boundingBox: { x: 240, y: 186, width: 320, height: 40 },
      note: "Password input matches specification."
    },
    {
      elementId: "el2",
      matchedExtractionId: "dom3",
      verdict: "position_mismatch",
      checks: [
        { field: "backgroundColor", expected: "#2563EB", actual: "#2563eb", pass: true },
        { field: "text", expected: "Sign in", actual: "Sign in", pass: true },
        { field: "position.offsetPx", expected: 24, actual: 24, pass: false, deltaPx: 0 }
      ],
      boundingBox: { x: 240, y: 250, width: 120, height: 40 },
      note: "Button is aligned left instead of centered horizontally."
    },
    {
      elementId: "el3",
      matchedExtractionId: null,
      verdict: "missing",
      checks: [
        { field: "role", expected: "forgot password link", actual: null, pass: false }
      ],
      boundingBox: null,
      note: "Expected 'Forgot password?' link is missing from DOM extraction."
    }
  ],
  summary: {
    totalChecked: 4,
    mismatches: 2,
    status: "mismatch"
  }
};

export const SAMPLE_RETRY_DIFF = {
  ...SAMPLE_DIFF,
  results: [
    {
      elementId: "el0",
      matchedExtractionId: "dom1",
      verdict: "match",
      checks: [{ field: "type", expected: "input", actual: "input", pass: true }],
      boundingBox: { x: 240, y: 130, width: 320, height: 40 },
      note: "Email input matches specification."
    },
    {
      elementId: "el1",
      matchedExtractionId: "dom2",
      verdict: "match",
      checks: [{ field: "type", expected: "input", actual: "input", pass: true }],
      boundingBox: { x: 240, y: 186, width: 320, height: 40 },
      note: "Password input matches specification."
    },
    {
      elementId: "el2",
      matchedExtractionId: "dom3",
      verdict: "match",
      checks: [
        { field: "backgroundColor", expected: "#2563EB", actual: "#2563eb", pass: true },
        { field: "alignment", expected: "center", actual: "center", pass: true }
      ],
      boundingBox: { x: 340, y: 250, width: 120, height: 40 },
      note: "Button is now correctly centered 24px below inputs."
    }
  ],
  summary: {
    totalChecked: 3,
    mismatches: 0,
    status: "match"
  },
  retry: {
    attempted: true,
    previousDiffSummary: { totalChecked: 4, mismatches: 2 },
    resultAfterRetry: { totalChecked: 3, mismatches: 0 }
  }
};
