// ResultsPage (You + Duchuu)
// Consumes diff.json only (docs/SCHEMA.md section 3). Renders SummaryBanner +
// OverlayCanvas over the screenshot, plus RetryBeforeAfter when diff.retry is present.
export default function ResultsPage({ diff }) {
  if (!diff) return <p>No results yet.</p>;
  return (
    <div>
      {/* TODO: SummaryBanner, OverlayCanvas, RetryBeforeAfter */}
      <pre>{JSON.stringify(diff.summary, null, 2)}</pre>
    </div>
  );
}
