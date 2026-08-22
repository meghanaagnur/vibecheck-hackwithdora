// api.js — calls into services/render-extract + services/checklist-diff.
// Keep this the ONLY place that knows the backend URLs, so swapping local/deployed
// endpoints during the hackathon doesn't touch component code.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

export async function runCheck({ prompt, code, useAgent = false }) {
  const res = await fetch(`${BASE_URL}/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, code, useAgent }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || `HTTP ${res.status}: Failed to run check`);
  }

  return await res.json();
}

export async function retryCheck({ prompt, previousCode, diffResult }) {
  const res = await fetch(`${BASE_URL}/retry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, previousCode, diffResult }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || `HTTP ${res.status}: Failed to retry check`);
  }

  return await res.json();
}
