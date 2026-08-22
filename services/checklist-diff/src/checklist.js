import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables from services/checklist-diff/.env and root .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const CHECKLIST_SYSTEM_PROMPT = `You are an expert UI specification extraction assistant for VibeCheck.
Your job is to convert a natural language UI prompt into a structured JSON checklist matching this exact schema:

{
  "checklistVersion": "1.0",
  "sourcePrompt": "<exact source prompt>",
  "elements": [
    {
      "id": "el-0",
      "type": "input", // allowed values: "button" | "input" | "text" | "image" | "heading" | "container" | "link"
      "role": "email", // free-text semantic hint or null if not applicable (e.g. "email", "password", "submit", "header", "title")
      "expected": {
        "text": null, // string or null if not specified in prompt
        "color": null, // foreground text color in 6-digit hex format (e.g. "#FFFFFF") or null
        "backgroundColor": null, // background color in 6-digit hex format (e.g. "#2563EB") or null
        "position": { // or null if no positioning is specified
          "relativeTo": "el-0", // id of another element (e.g. "el-0"), "viewport", or null
          "direction": "below", // "above" | "below" | "left-of" | "right-of" | "inside" | null
          "offsetPx": 24 // integer pixel offset or null
        },
        "size": { // or null if no size is specified
          "widthPx": 120, // integer px or null
          "heightPx": 40 // integer px or null
        },
        "alignment": "center" // "left" | "center" | "right" | null
      }
    }
  ]
}

Rules:
1. Every element MUST have a unique "id" starting from "el-0", "el-1", "el-2", etc.
2. Only include expected attributes if the prompt explicitly or strongly implies them. If a field was NOT specified in the prompt, set it to null.
3. Colors MUST be 6-digit hex strings (e.g. "#2563EB", "#FFFFFF", "#000000").
4. "position.relativeTo" must reference a preceding element id (e.g. "el-0") or "viewport".
5. Return ONLY valid JSON matching this schema.`;

/**
 * Deterministic fallback generator for when GEMINI_API_KEY is not configured
 * or for offline fixture testing.
 */
function generateFallbackChecklist(prompt) {
  const normalized = (prompt || "").toLowerCase();
  const elements = [];
  let idCounter = 0;

  if (normalized.includes("email") || normalized.includes("login")) {
    elements.push({
      id: `el-${idCounter++}`,
      type: "input",
      role: "email",
      expected: {
        text: null,
        color: null,
        backgroundColor: null,
        position: null,
        size: null,
        alignment: null,
      },
    });
  }

  if (normalized.includes("password") || normalized.includes("login")) {
    elements.push({
      id: `el-${idCounter++}`,
      type: "input",
      role: "password",
      expected: {
        text: null,
        color: null,
        backgroundColor: null,
        position: elements.length > 0 ? {
          relativeTo: elements[elements.length - 1].id,
          direction: "below",
          offsetPx: 16,
        } : null,
        size: null,
        alignment: null,
      },
    });
  }

  if (normalized.includes("button") || normalized.includes("submit") || normalized.includes("sign in")) {
    const isBlue = normalized.includes("blue") || normalized.includes("#2563eb");
    const has24px = normalized.includes("24px");
    const prevId = elements.length > 0 ? elements[elements.length - 1].id : null;

    elements.push({
      id: `el-${idCounter++}`,
      type: "button",
      role: "submit",
      expected: {
        text: normalized.includes("sign in") ? "Sign in" : (normalized.includes("submit") ? "Submit" : "Sign in"),
        color: "#FFFFFF",
        backgroundColor: isBlue ? "#2563EB" : null,
        position: prevId ? {
          relativeTo: prevId,
          direction: "below",
          offsetPx: has24px ? 24 : 16,
        } : null,
        size: {
          widthPx: 120,
          heightPx: 40,
        },
        alignment: "center",
      },
    });
  }

  // If nothing matched, provide at least one generic container or element
  if (elements.length === 0) {
    elements.push({
      id: `el-${idCounter++}`,
      type: "container",
      role: "main",
      expected: {
        text: null,
        color: null,
        backgroundColor: null,
        position: null,
        size: null,
        alignment: "center",
      },
    });
  }

  return {
    checklistVersion: "1.0",
    sourcePrompt: prompt,
    elements,
  };
}

/**
 * Normalizes and validates the checklist JSON structure against schema/checklist.example.json
 */
function normalizeChecklist(data, sourcePrompt) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid checklist JSON: root must be an object");
  }

  const checklistVersion = data.checklistVersion || "1.0";
  const elements = Array.isArray(data.elements) ? data.elements : [];

  const normalizedElements = elements.map((el, index) => {
    const id = el.id || `el-${index}`;
    const type = ["button", "input", "text", "image", "heading", "container", "link"].includes(el.type)
      ? el.type
      : "container";
    const role = el.role || null;
    const expectedRaw = el.expected || {};

    let position = null;
    if (expectedRaw.position && typeof expectedRaw.position === "object") {
      position = {
        relativeTo: expectedRaw.position.relativeTo || null,
        direction: expectedRaw.position.direction || null,
        offsetPx: typeof expectedRaw.position.offsetPx === "number" ? expectedRaw.position.offsetPx : null,
      };
    }

    let size = null;
    if (expectedRaw.size && typeof expectedRaw.size === "object") {
      size = {
        widthPx: typeof expectedRaw.size.widthPx === "number" ? expectedRaw.size.widthPx : null,
        heightPx: typeof expectedRaw.size.heightPx === "number" ? expectedRaw.size.heightPx : null,
      };
    }

    const expected = {
      text: typeof expectedRaw.text === "string" ? expectedRaw.text : null,
      color: typeof expectedRaw.color === "string" ? expectedRaw.color.toUpperCase() : null,
      backgroundColor: typeof expectedRaw.backgroundColor === "string" ? expectedRaw.backgroundColor.toUpperCase() : null,
      position,
      size,
      alignment: ["left", "center", "right"].includes(expectedRaw.alignment) ? expectedRaw.alignment : null,
    };

    return { id, type, role, expected };
  });

  return {
    checklistVersion,
    sourcePrompt: data.sourcePrompt || sourcePrompt,
    elements: normalizedElements,
  };
}

export async function generateChecklist(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.warn("[checklist] GEMINI_API_KEY is not set in environment or .env. Using fallback structured checklist generator.");
    return generateFallbackChecklist(prompt);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
      systemInstruction: CHECKLIST_SYSTEM_PROMPT,
    });

    const userMessage = `Generate the VibeCheck checklist JSON for the following UI prompt:\n\n"${prompt}"`;
    const result = await model.generateContent(userMessage);
    const responseText = result.response.text();

    const parsed = JSON.parse(responseText);
    return normalizeChecklist(parsed, prompt);
  } catch (err) {
    console.error("[checklist] Error calling Gemini API for checklist generation:", err.message);
    console.warn("[checklist] Falling back to structured heuristic checklist generator.");
    return generateFallbackChecklist(prompt);
  }
}
