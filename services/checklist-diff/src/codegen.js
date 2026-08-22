// codegen.js (Aryan) — prompt -> generated HTML/React code
// The "agent-generated code" flow: ship with ONE agent (Claude API) only.
// Feeds output straight into services/render-extract. Do not start this until
// checklist.js is stable (see README.md ordering).

export async function generateCode(/* prompt */) {
  throw new Error("TODO: call Claude API to generate HTML/React for the given prompt");
}

// Retry pass: feed the previous diff's mismatches back in, regenerate ONCE (capped).
export async function regenerateWithFeedback(/* prompt, previousCode, diffResult */) {
  throw new Error("TODO: single capped retry — never loop");
}
