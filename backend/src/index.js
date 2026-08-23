// Unified backend entrypoint
export { generateChecklist } from "./checklist.js";
export { diff, TOLERANCES } from "./diff.js";
export { generateCode, regenerateWithFeedback } from "./codegen.js";
export { createApp, startServer } from "./server.js";
export { extract } from "./extract.js";
export { suggestPromptImprovements } from "./promptCoach.js";
export { runAccessibilityChecks } from "./accessibility.js";
