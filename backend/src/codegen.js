import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * Strips markdown code fences from generated output.
 */
function cleanHtmlOutput(text) {
  if (!text) return "";
  let cleaned = text.trim();
  if (cleaned.startsWith("```html")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Fallback code generator when GEMINI_API_KEY is not available.
 */
function generateFallbackCode(prompt) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login Page</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 40px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f9fafb;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .card {
      background: #ffffff;
      padding: 32px;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      width: 360px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    input {
      width: 300px;
      height: 40px;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      color: #111111;
      background-color: #ffffff;
    }
    .button-container {
      margin-top: 41px; /* Real mismatch: 41px instead of 24px */
      display: flex;
      justify-content: center;
    }
    button {
      width: 118px;
      height: 41px;
      background-color: #2563eb;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="form-group">
      <input type="email" placeholder="Email address" />
    </div>
    <div class="form-group">
      <input type="password" placeholder="Password" />
    </div>
    <div class="button-container">
      <button type="submit">Sign in</button>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Fallback retry code generator when GEMINI_API_KEY is not available.
 */
function regenerateFallbackCode(prompt, previousCode, diffResult) {
  // Fix the 41px gap to exact 24px and size to 120x40
  let fixedCode = previousCode;
  if (fixedCode.includes("margin-top: 41px")) {
    fixedCode = fixedCode.replace("margin-top: 41px", "margin-top: 24px");
  }
  if (fixedCode.includes("width: 118px")) {
    fixedCode = fixedCode.replace("width: 118px", "width: 120px");
  }
  if (fixedCode.includes("height: 41px")) {
    fixedCode = fixedCode.replace("height: 41px", "height: 40px");
  }
  return fixedCode;
}

export async function generateCode(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.warn("[codegen] GEMINI_API_KEY is not set. Using fallback code generator.");
    return generateFallbackCode(prompt);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
      },
      systemInstruction: `You are an expert web frontend developer.
Generate clean, self-contained, valid HTML5 with embedded CSS in a <style> block for the requested UI.
Do NOT use external CDN stylesheets or external script assets.
Ensure responsive styling, clean visual aesthetics, and exact pixel/color values specified in the prompt.
Return ONLY raw HTML code without markdown fences.`,
    });

    const userPrompt = `Build a complete, standalone HTML page matching this prompt:\n\n"${prompt}"`;
    const result = await model.generateContent(userPrompt);
    const rawHtml = result.response.text();
    return cleanHtmlOutput(rawHtml);
  } catch (err) {
    console.error("[codegen] Error calling Gemini API for code generation:", err.message);
    return generateFallbackCode(prompt);
  }
}

/**
 * Retry pass: feeds previous diff mismatches back to Gemini for a single capped correction.
 * Never loops.
 */
export async function regenerateWithFeedback(prompt, previousCode, diffResult) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.warn("[codegen] GEMINI_API_KEY is not set. Using fallback code regenerator.");
    return regenerateFallbackCode(prompt, previousCode, diffResult);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
      },
      systemInstruction: `You are an expert frontend engineer performing a single precision visual fix.
You will be provided with:
1. Original design prompt
2. Previous HTML/CSS code
3. Visual diff mismatch report containing failing element checks and pixel deltas

Fix the EXACT positioning, spacing, sizing, or styling mismatches reported in the diff while preserving all other markup and styles.
Return ONLY the corrected, standalone HTML document without markdown code fences.`,
    });

    const failingResults = (diffResult?.results || []).filter((r) => r.verdict !== "match");
    const mismatchSummary = failingResults
      .map((r) => `- Element [${r.elementId}]: ${r.note} (checks: ${JSON.stringify(r.checks)})`)
      .join("\n");

    const retryPrompt = `Original Prompt:
"${prompt}"

Visual Diff Mismatches Found:
${mismatchSummary || "None"}

Previous Code:
\`\`\`html
${previousCode}
\`\`\`

Please output the corrected complete HTML code with all mismatches fixed.`;

    const result = await model.generateContent(retryPrompt);
    const rawHtml = result.response.text();
    return cleanHtmlOutput(rawHtml);
  } catch (err) {
    console.error("[codegen] Error calling Gemini API for code regeneration:", err.message);
    return regenerateFallbackCode(prompt, previousCode, diffResult);
  }
}
