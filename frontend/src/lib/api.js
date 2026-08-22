// api.js — calls into services/render-extract + services/checklist-diff.
// Keep this the ONLY place that knows the backend URLs, so swapping local/deployed
// endpoints during the hackathon doesn't touch component code.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

export async function runCheck(/* { prompt, code, useAgent } */) {
  throw new Error("TODO: POST to backend, return diff.json");
}

export async function retryCheck(/* diffResult */) {
  throw new Error("TODO: POST retry request, return diff.json with retry block populated");
}
