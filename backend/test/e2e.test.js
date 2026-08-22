import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateChecklist } from "../src/checklist.js";
import { extract } from "../src/extract.js";
import { diff } from "../src/diff.js";
import { createApp } from "../src/server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runEndToEnd() {
  console.log("=== Running End-to-End Pipeline Test ===");

  const fixtureDir = path.resolve(__dirname, "../../fixtures/test-cases/login-page");
  const prompt = fs.readFileSync(path.join(fixtureDir, "prompt.txt"), "utf-8").trim();
  const code = fs.readFileSync(path.join(fixtureDir, "code.html"), "utf-8");

  console.log("1. Generating checklist...");
  const checklist = await generateChecklist(prompt);
  if (!checklist.elements || checklist.elements.length === 0) {
    throw new Error("generateChecklist produced empty elements");
  }

  console.log("2. Extracting DOM with Playwright...");
  const extraction = await extract(code);
  if (!extraction.elements || extraction.elements.length === 0) {
    throw new Error("extract produced no DOM elements");
  }
  if (!extraction.screenshot || !extraction.screenshot.startsWith("data:image/png;base64,")) {
    throw new Error("extract did not return a valid base64 screenshot");
  }

  console.log("3. Computing diff...");
  const diffResult = await diff(checklist, extraction);
  if (!diffResult.summary || typeof diffResult.summary.totalChecked !== "number") {
    throw new Error("diff summary is invalid");
  }
  if (!Array.isArray(diffResult.results) || diffResult.results.length === 0) {
    throw new Error("diff results array is empty or invalid");
  }

  console.log("4. Testing Express server routes...");
  const app = createApp();
  const port = 3098;
  const server = app.listen(port);

  try {
    // POST /check
    const checkRes = await fetch(`http://localhost:${port}/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, code }),
    });
    if (!checkRes.ok) throw new Error(`/check failed with status ${checkRes.status}`);
    const checkJson = await checkRes.json();
    if (!checkJson.results || !checkJson.summary) {
      throw new Error("/check response missing summary or results");
    }

    // POST /retry
    const retryRes = await fetch(`http://localhost:${port}/retry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, previousCode: code, diffResult: checkJson }),
    });
    if (!retryRes.ok) throw new Error(`/retry failed with status ${retryRes.status}`);
    const retryJson = await retryRes.json();
    if (!retryJson.retry || !retryJson.retry.attempted) {
      throw new Error("/retry response missing retry block");
    }

    console.log(">>> ALL CHECKS PASSED: Pipeline verified end-to-end! <<<");
  } finally {
    server.close();
  }
}

runEndToEnd().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
