import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

import { generateChecklist } from "./checklist.js";
import { diff } from "./diff.js";
import { generateCode, regenerateWithFeedback } from "./codegen.js";
import { extract } from "./extract.js";
import { suggestPromptImprovements } from "./promptCoach.js";
import { runAccessibilityChecks } from "./accessibility.js";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export function createApp() {
  const app = express();

  // Enable CORS for frontend (default localhost:5173 and allow all local development origins)
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ],
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "vibecheck-backend", port: 3001 });
  });

  /**
   * POST /check
   * Body: { prompt: string, code?: string, useAgent?: boolean }
   * Returns: diff.json shape
   */
  app.post("/check", async (req, res) => {
    try {
      const { prompt, code: inputCode, useAgent } = req.body || {};

      if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
        return res.status(400).json({ error: "Missing required field: 'prompt'" });
      }

      console.log(`[POST /check] Processing request for prompt: "${prompt.slice(0, 60)}..."`);

      let targetCode = inputCode;
      if (useAgent || !targetCode || targetCode.trim() === "") {
        console.log("[POST /check] Generating code via agent...");
        targetCode = await generateCode(prompt);
      }

      console.log("[POST /check] Generating checklist and extracting DOM render in parallel...");
      const [checklist, extraction] = await Promise.all([
        generateChecklist(prompt),
        extract(targetCode),
      ]);

      console.log("[POST /check] Computing visual & structural diff...");
      const diffResult = await diff(checklist, extraction);

      // Attach screenshot and code for frontend consumers
      diffResult.screenshot = extraction.screenshot;
      diffResult.code = targetCode;
      diffResult.promptSuggestions = suggestPromptImprovements(diffResult);
      diffResult.accessibilityIssues = runAccessibilityChecks(extraction);

      res.json(diffResult);
    } catch (err) {
      console.error("[POST /check] Error processing check request:", err);
      res.status(500).json({
        error: "Failed to process visual check",
        message: err.message,
      });
    }
  });

  /**
   * POST /retry
   * Body: { prompt: string, previousCode: string, diffResult: Object }
   * Returns: diff.json shape with retry block populated
   */
  app.post("/retry", async (req, res) => {
    try {
      const { prompt, previousCode, diffResult } = req.body || {};

      if (!prompt || !previousCode || !diffResult) {
        return res.status(400).json({
          error: "Missing required fields: 'prompt', 'previousCode', and 'diffResult' are all required",
        });
      }

      console.log(`[POST /retry] Processing single-retry pass for prompt: "${prompt.slice(0, 60)}..."`);

      // 1. Single capped retry codegen
      console.log("[POST /retry] Regenerating code with visual feedback...");
      const newCode = await regenerateWithFeedback(prompt, previousCode, diffResult);

      // 2. Generate checklist (or reuse) and extract new render
      console.log("[POST /retry] Re-extracting rendered DOM...");
      const [checklist, newExtraction] = await Promise.all([
        generateChecklist(prompt),
        extract(newCode),
      ]);

      // 3. Diff again
      console.log("[POST /retry] Computing new diff after retry...");
      const newDiffResult = await diff(checklist, newExtraction);

      // 4. Populate retry block as specified in docs/SCHEMA.md section 3
      newDiffResult.retry = {
        attempted: true,
        previousDiffSummary: diffResult.summary || {
          totalChecked: (diffResult.results || []).length,
          mismatches: (diffResult.results || []).filter((r) => r.verdict !== "match").length,
        },
        resultAfterRetry: {
          totalChecked: newDiffResult.summary.totalChecked,
          mismatches: newDiffResult.summary.mismatches,
        },
      };

      // Attach new screenshot and code for frontend display
      newDiffResult.screenshot = newExtraction.screenshot;
      newDiffResult.code = newCode;
      newDiffResult.previousCode = previousCode;
      newDiffResult.promptSuggestions = suggestPromptImprovements(newDiffResult);
      newDiffResult.accessibilityIssues = runAccessibilityChecks(newExtraction);

      res.json(newDiffResult);
    } catch (err) {
      console.error("[POST /retry] Error processing retry request:", err);
      res.status(500).json({
        error: "Failed to process visual retry",
        message: err.message,
      });
    }
  });

  return app;
}

export function startServer(port = process.env.PORT || 3001) {
  const app = createApp();
  return app.listen(port, () => {
    console.log(`[vibecheck-server] Server listening on http://localhost:${port}`);
  });
}

// Start server if executed directly
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const PORT = process.env.PORT || 3001;
  startServer(PORT);
}
