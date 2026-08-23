export default function SummaryBanner({ summary, retry }) {
  if (!summary) return null;

  const isMatch = summary.status === "match" || summary.mismatches === 0;
  const passedCount = Math.max(0, summary.totalChecked - summary.mismatches);
  
  // Calculate retry fix statistics if retry block is present
  let retryDiffNote = null;
  if (retry?.attempted && retry?.resultAfterRetry) {
    const prevMismatches = retry.previousDiffSummary?.mismatches ?? summary.mismatches;
    const currentMismatches = retry.resultAfterRetry.mismatches;
    const fixedCount = prevMismatches - currentMismatches;
    
    if (fixedCount > 0) {
      retryDiffNote = `${fixedCount} ${fixedCount === 1 ? "mismatch" : "mismatches"} fixed in AI retry pass`;
    } else if (currentMismatches === 0) {
      retryDiffNote = "All mismatches resolved in AI retry pass";
    } else {
      retryDiffNote = "AI retry pass completed";
    }
  }

  return (
    <div className={`summary-banner ${isMatch ? "banner-success" : "banner-warning"}`}>
      <div className="banner-icon-col">
        <span className="banner-large-icon">{isMatch ? "✓" : "⚠"}</span>
      </div>

      <div className="banner-content-col">
        <div className="banner-headline-row">
          <span className="banner-title">
            {isMatch ? "Vibes Verified: All Elements Match" : "Visual Mismatches Detected"}
          </span>
          <span className={`status-pill ${isMatch ? "pill-success" : "pill-warning"}`}>
            {summary.status.toUpperCase()}
          </span>
          {retry?.attempted && (
            <span className="status-pill pill-retry">
              RETRY PASS
            </span>
          )}
        </div>

        <div className="banner-description">
          <strong>{summary.totalChecked}</strong> elements checked,{" "}
          <strong>{summary.mismatches}</strong> {summary.mismatches === 1 ? "mismatch" : "mismatches"} found
          {retryDiffNote && <span className="retry-highlight"> · {retryDiffNote}</span>}.
        </div>
      </div>

      <div className="banner-stats-col">
        <div className="stat-pill stat-checked">
          <span className="stat-num">{summary.totalChecked}</span>
          <span className="stat-lbl">Checked</span>
        </div>
        <div className="stat-pill stat-passed">
          <span className="stat-num">{passedCount}</span>
          <span className="stat-lbl">Passed</span>
        </div>
        <div className={`stat-pill ${summary.mismatches > 0 ? "stat-mismatch" : "stat-zero"}`}>
          <span className="stat-num">{summary.mismatches}</span>
          <span className="stat-lbl">Mismatches</span>
        </div>
      </div>
    </div>
  );
}
