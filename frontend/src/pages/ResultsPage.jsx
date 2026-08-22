import { useState } from "react";
import SummaryBanner from "../components/SummaryBanner.jsx";
import OverlayCanvas, { VERDICT_CONFIG } from "../components/OverlayCanvas.jsx";
import RetryBeforeAfter from "../components/RetryBeforeAfter.jsx";
import { retryCheck } from "../lib/api.js";
import { SAMPLE_RETRY_DIFF } from "../lib/sampleFixtures.js";

export default function ResultsPage({
  diff,
  previousDiff,
  submissionContext = {},
  onRetrySuccess,
  onStartOver,
}) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState(null);
  const [hoveredElementId, setHoveredElementId] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' | 'mismatches' | 'matches'

  if (!diff) {
    return (
      <div className="results-empty">
        <p>No results yet.</p>
        <button className="btn btn-primary" onClick={onStartOver}>
          Go to Upload
        </button>
      </div>
    );
  }

  const results = diff.results || [];
  const hasRetry = Boolean(diff.retry?.attempted);
  const hasMismatches = (diff.summary?.mismatches || 0) > 0;

  const filteredResults = results.filter((r) => {
    if (filter === "mismatches") return r.verdict !== "match";
    if (filter === "matches") return r.verdict === "match";
    return true;
  });

  const handleRetry = async () => {
    setRetrying(true);
    setRetryError(null);

    try {
      const retryResult = await retryCheck({
        prompt: submissionContext.prompt || "",
        previousCode: submissionContext.code || "",
        diffResult: diff,
      });
      onRetrySuccess(retryResult);
    } catch (err) {
      console.error("Retry check error:", err);
      setRetryError(err.message || "Failed to execute AI retry pass.");
    } finally {
      setRetrying(false);
    }
  };

  const handleDemoRetry = () => {
    onRetrySuccess(SAMPLE_RETRY_DIFF);
    setRetryError(null);
  };

  return (
    <div className="results-page">
      {/* Top Navigation Bar */}
      <nav className="results-nav-bar">
        <button className="btn-back" onClick={onStartOver}>
          ← Start New Check
        </button>

        <div className="nav-title-group">
          <span className="nav-logo">VibeCheck Results</span>
          {submissionContext.prompt && (
            <span className="prompt-preview-pill" title={submissionContext.prompt}>
              Spec: "{submissionContext.prompt.slice(0, 45)}..."
            </span>
          )}
        </div>

        <div className="nav-actions">
          {hasMismatches && !hasRetry && (
            <button
              className="btn btn-retry"
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? (
                <span className="loading-spinner-wrap">
                  <span className="spinner"></span> AI Regenerating (1-Pass Retry)...
                </span>
              ) : (
                "✨ Run AI Fix (1-Pass Retry)"
              )}
            </button>
          )}

          {hasRetry && (
            <span className="retry-status-badge">
              ✓ Single Retry Pass Applied
            </span>
          )}
        </div>
      </nav>

      {retryError && (
        <div className="alert-box error-alert" role="alert">
          <div className="alert-content">
            <strong>Retry error:</strong> {retryError}
          </div>
          <div className="alert-actions">
            <button
              type="button"
              className="btn-link"
              onClick={handleDemoRetry}
              title="Preview retry comparison using demo fixture data"
            >
              Preview with Demo Retry Fix →
            </button>
          </div>
        </div>
      )}

      {/* Summary Banner */}
      <SummaryBanner summary={diff.summary} retry={diff.retry} />

      {/* Primary Visual Verification View */}
      <main className="results-main-content">
        {hasRetry ? (
          <RetryBeforeAfter
            previousDiff={previousDiff || diff}
            currentDiff={diff}
          />
        ) : (
          <section className="overlay-section">
            <div className="section-header-row">
              <h2 className="section-title">Visual Verification Overlay</h2>
              <div className="legend-pills">
                <span className="legend-pill pill-match">● Green = Matched Spec</span>
                <span className="legend-pill pill-mismatch">● Yellow = Position/Style Mismatch</span>
                <span className="legend-pill pill-missing">● Red = Missing from DOM</span>
              </div>
            </div>

            <div className="canvas-centering-box">
              <OverlayCanvas
                screenshot={diff.screenshot}
                results={results}
                hoveredElementId={hoveredElementId}
                onHoverElement={setHoveredElementId}
              />
            </div>
          </section>
        )}

        {/* Detailed Elements Checklist Inspector */}
        <section className="inspector-section">
          <div className="section-header-row">
            <h3 className="section-subtitle">
              Element Breakdown ({results.length} Checked)
            </h3>

            <div className="filter-button-group">
              <button
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({results.length})
              </button>
              <button
                className={`filter-btn ${filter === "mismatches" ? "active" : ""}`}
                onClick={() => setFilter("mismatches")}
              >
                Mismatches ({results.filter((r) => r.verdict !== "match").length})
              </button>
              <button
                className={`filter-btn ${filter === "matches" ? "active" : ""}`}
                onClick={() => setFilter("matches")}
              >
                Passed ({results.filter((r) => r.verdict === "match").length})
              </button>
            </div>
          </div>

          <div className="element-cards-grid">
            {filteredResults.map((result) => {
              const cfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.match;
              const isHovered = hoveredElementId === result.elementId;

              return (
                <div
                  key={result.elementId}
                  className={`element-card ${cfg.badgeClass} ${
                    isHovered ? "card-highlighted" : ""
                  }`}
                  onMouseEnter={() => setHoveredElementId(result.elementId)}
                  onMouseLeave={() => setHoveredElementId(null)}
                >
                  <div className="card-top-row">
                    <span className="el-badge" style={{ backgroundColor: cfg.color }}>
                      {cfg.icon} {result.elementId}
                    </span>
                    <span className="verdict-label" style={{ color: cfg.color }}>
                      {cfg.label}
                    </span>
                    {result.matchedExtractionId && (
                      <span className="dom-node-tag">DOM: {result.matchedExtractionId}</span>
                    )}
                  </div>

                  <p className="card-note">{result.note}</p>

                  {result.checks && result.checks.length > 0 && (
                    <div className="card-checks-list">
                      {result.checks.map((chk, i) => (
                        <div
                          key={i}
                          className={`check-chip ${chk.pass ? "chip-pass" : "chip-fail"}`}
                        >
                          <span className="chip-icon">{chk.pass ? "✓" : "✗"}</span>
                          <span className="chip-field">{chk.field}:</span>
                          <span className="chip-values">
                            expected <code>{String(chk.expected)}</code>, got{" "}
                            <code>{String(chk.actual)}</code>
                          </span>
                          {typeof chk.deltaPx === "number" && (
                            <span className="delta-tag">
                              {chk.deltaPx > 0 ? `+${chk.deltaPx}px` : `${chk.deltaPx}px`}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {result.boundingBox && (
                    <div className="card-coords">
                      BoundingBox: [{result.boundingBox.x}px, {result.boundingBox.y}px,{" "}
                      {result.boundingBox.width}×{result.boundingBox.height}px]
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
