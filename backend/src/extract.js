import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const DEFAULT_VIEWPORT = { width: 1280, height: 800 };

/**
 * Extracts DOM bounding boxes, computed styles, attributes, and screenshot using Playwright.
 * @param {string} htmlOrPath - HTML string or path to an HTML file / directory
 * @param {Object} [options]
 * @param {{width: number, height: number}} [options.viewport]
 * @returns {Promise<Object>} extraction.json shape
 */
export async function extract(htmlOrPath, options = {}) {
  const viewport = options.viewport || DEFAULT_VIEWPORT;

  let htmlContent = htmlOrPath;

  // If htmlOrPath is a file path or directory, read its content
  if (typeof htmlOrPath === "string" && !htmlOrPath.trim().startsWith("<") && !htmlOrPath.includes("\n")) {
    try {
      const stats = await fs.stat(htmlOrPath);
      let targetFile = htmlOrPath;
      if (stats.isDirectory()) {
        const candidates = ["code.html", "index.html", "code.jsx"];
        for (const candidate of candidates) {
          const candidatePath = path.join(htmlOrPath, candidate);
          try {
            await fs.access(candidatePath);
            targetFile = candidatePath;
            break;
          } catch {
            // continue
          }
        }
      }
      htmlContent = await fs.readFile(targetFile, "utf-8");
    } catch {
      // If reading fails, treat as raw HTML string
      htmlContent = htmlOrPath;
    }
  }

  if (!htmlContent || typeof htmlContent !== "string") {
    htmlContent = "<!DOCTYPE html><html><body></body></html>";
  }

  // Ensure full HTML document wrapper if snippet is provided
  if (!htmlContent.includes("<html") && !htmlContent.includes("<!DOCTYPE")) {
    htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();

    // Set page content and wait for fonts/styles to load
    await page.setContent(htmlContent, { waitUntil: "load" });
    try {
      await page.waitForLoadState("networkidle", { timeout: 3000 });
    } catch {
      // Timeout is acceptable for pages without external requests
    }

    // Capture base64 screenshot at viewport resolution
    const screenshotBuffer = await page.screenshot({
      type: "png",
      fullPage: false,
    });
    const screenshot = `data:image/png;base64,${screenshotBuffer.toString("base64")}`;

    // Extract DOM elements
    const elements = await page.evaluate(() => {
      function rgbToHex(colorStr) {
        if (!colorStr) return null;
        const s = colorStr.trim().toLowerCase();
        if (s.startsWith("#")) return s;
        if (s === "transparent" || s === "rgba(0, 0, 0, 0)") return "transparent";
        const match = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = parseInt(match[1], 10).toString(16).padStart(2, "0");
          const g = parseInt(match[2], 10).toString(16).padStart(2, "0");
          const b = parseInt(match[3], 10).toString(16).padStart(2, "0");
          return `#${r}${g}${b}`;
        }
        return s;
      }

      const ignoredTags = new Set([
        "SCRIPT",
        "STYLE",
        "NOSCRIPT",
        "TEMPLATE",
        "META",
        "LINK",
        "TITLE",
        "HEAD",
        "HTML",
        "BODY",
      ]);

      const allNodes = Array.from(document.querySelectorAll("*"));
      const extracted = [];
      let elementIndex = 1;

      for (const el of allNodes) {
        const tag = el.tagName.toUpperCase();
        if (ignoredTags.has(tag)) continue;

        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        // Filter out invisible elements or elements with zero dimensions
        if (
          rect.width <= 0 ||
          rect.height <= 0 ||
          style.display === "none" ||
          style.visibility === "hidden" ||
          parseFloat(style.opacity || "1") === 0
        ) {
          continue;
        }

        // Get text content or input placeholder/value
        let text = "";
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
          text = el.value || el.placeholder || "";
        } else if (tag === "IMG") {
          text = el.getAttribute("alt") || "";
        } else {
          // Direct text or child text (trimmed)
          text = (el.innerText || el.textContent || "").trim();
        }

        const colorHex = rgbToHex(style.color);
        const bgHex = rgbToHex(style.backgroundColor);

        extracted.push({
          id: `dom-${elementIndex++}`,
          tag: tag.toLowerCase(),
          text,
          boundingBox: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          computedStyle: {
            color: colorHex === "transparent" ? "#000000" : colorHex || "#000000",
            backgroundColor: bgHex || "transparent",
            fontSize: style.fontSize || "16px",
            fontWeight: style.fontWeight || "400",
          },
          attributes: {
            alt: el.getAttribute("alt") || null,
            ariaLabel: el.getAttribute("aria-label") || el.getAttribute("ariaLabel") || null,
            role: el.getAttribute("role") || 
                  (["INPUT", "BUTTON", "TEXTAREA", "SELECT"].includes(tag) ? el.type || el.getAttribute("type") || tag.toLowerCase() : null),
          },
        });
      }

      return extracted;
    });

    return {
      extractionVersion: "1.0",
      screenshot,
      viewport,
      elements,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// CLI / Standalone runner support
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const args = process.argv.slice(2);
  let target = path.resolve(process.cwd(), "../fixtures/test-cases/login-page");
  const fixtureIndex = args.indexOf("--fixture");
  if (fixtureIndex !== -1 && args[fixtureIndex + 1]) {
    target = path.resolve(process.cwd(), args[fixtureIndex + 1]);
  } else if (args[0]) {
    target = path.resolve(process.cwd(), args[0]);
  }

  extract(target)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
