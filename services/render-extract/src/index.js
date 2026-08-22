// render-extract entrypoint (Aalok)
//
// Contract: read generated code (HTML/React) for one test case, render it headlessly
// with Playwright, walk the DOM, and emit extraction.json matching the shape in
// /docs/SCHEMA.md (section 2) and /schema/extraction.example.json.
//
// Keep this service "dumb": measure everything, decide nothing. Matching extracted
// elements to checklist elements is the diff engine's job (services/checklist-diff),
// not this service's.

async function extract(/* testCasePath */) {
  throw new Error("TODO: implement Playwright render + extraction — see docs/SCHEMA.md");
}

extract().catch((err) => {
  console.error(err);
  process.exit(1);
});
