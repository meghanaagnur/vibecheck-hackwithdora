// api.js — calls into backend on port 3001 (or VITE_API_BASE_URL).
// Keep this the ONLY place that knows the backend URLs, so swapping local/deployed
// endpoints during the hackathon doesn't touch component code.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

/**
 * Helper to make a POST request with JSON payload and readable error handling.
 */
async function postJson(endpoint, body) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new Error(
      `Failed to connect to backend at ${BASE_URL}${endpoint}. Please ensure the backend server is running on port 3001. (${networkErr.message})`
    );
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || errJson.message || JSON.stringify(errJson);
    } catch {
      try {
        errorDetail = await response.text();
      } catch {
        errorDetail = response.statusText;
      }
    }
    throw new Error(
      `Backend error (${response.status} ${response.statusText}): ${errorDetail || "Request failed"}`
    );
  }

  try {
    return await response.json();
  } catch (parseErr) {
    throw new Error(`Invalid JSON response from ${endpoint}: ${parseErr.message}`);
  }
}

/**
 * Runs visual verification check.
 * POST /check { prompt, code, useAgent } -> diff.json
 * @param {{ prompt: string, code?: string, useAgent?: boolean }} params
 * @returns {Promise<import('./types').DiffJSON>}
 */
export async function runCheck({ prompt, code, useAgent }) {
  return postJson("/check", { prompt, code, useAgent });
}

/**
 * Retries visual verification after feeding mismatch feedback to the agent.
 * POST /retry { prompt, previousCode, diffResult } -> diff.json (with retry block populated)
 * @param {{ prompt: string, previousCode?: string, diffResult: import('./types').DiffJSON }} params
 * @returns {Promise<import('./types').DiffJSON>}
 */
export async function retryCheck({ prompt, previousCode, diffResult }) {
  return postJson("/retry", { prompt, previousCode, diffResult });
}
