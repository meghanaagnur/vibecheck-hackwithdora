import OverlayCanvas from "./OverlayCanvas.jsx";

export default function RetryBeforeAfter({ previousDiff, currentDiff }) {
  // Present only when diff.retry is present and attempted
  if (!currentDiff?.retry?.attempted) return null;

  const prevSummary = currentDiff.retry.previousDiffSummary || previousDiff?.summary;
  const newSummary = currentDiff.retry.resultAfterRetry || currentDiff.summary;
  const fixedCount =
    (prevSummary?.mismatches ?? 0) - (newSummary?.mismatches ?? 0);

  return (
    <div className="retry-before-after-section">
      <div className="section-title-row">
        <h2 className="section-title">
          AI Retry Comparison (Before vs After)
        </h2>
        <span className="diff-improvement-badge">
          {fixedCount > 0
            ? `${fixedCount} ${fixedCount === 1 ? "mismatch" : "mismatches"} fixed`
            : "Retry pass completed"}
        </span>
      </div>

      <div className="before-after-grid">
        {/* Before Column */}
        <div className="before-after-card before-card">
          <div className="card-header">
            <span className="card-badge badge-before">1. BEFORE RETRY</span>
            <span className="card-mismatch-count">
              {prevSummary?.mismatches ?? "?"} mismatches
            </span>
          </div>
          <div className="card-body">
            <OverlayCanvas
              screenshot={previousDiff?.screenshot}
              results={previousDiff?.results || []}
            />
          </div>
        </div>

        {/* After Column */}
        <div className="before-after-card after-card">
          <div className="card-header">
            <span className="card-badge badge-after">2. AFTER RETRY (FIXED)</span>
            <span className="card-mismatch-count">
              {newSummary?.mismatches ?? 0} mismatches
            </span>
          </div>
          <div className="card-body">
            <OverlayCanvas
              screenshot={currentDiff.screenshot}
              results={currentDiff.results || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
