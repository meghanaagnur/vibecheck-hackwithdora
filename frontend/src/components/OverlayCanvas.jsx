import { useState } from "react";

// Verdict color and metadata mapping per docs/SCHEMA.md
export const VERDICT_CONFIG = {
  match: {
    color: "#10b981", // Green
    bg: "rgba(16, 185, 129, 0.16)",
    border: "2px solid #10b981",
    label: "Match",
    icon: "✓",
    badgeClass: "badge-match",
  },
  position_mismatch: {
    color: "#f59e0b", // Yellow/Amber
    bg: "rgba(245, 158, 11, 0.20)",
    border: "2px dashed #f59e0b",
    label: "Position Mismatch",
    icon: "⚠",
    badgeClass: "badge-mismatch",
  },
  style_mismatch: {
    color: "#f59e0b", // Yellow/Amber
    bg: "rgba(245, 158, 11, 0.20)",
    border: "2px dashed #f59e0b",
    label: "Style Mismatch",
    icon: "🎨",
    badgeClass: "badge-mismatch",
  },
  missing: {
    color: "#ef4444", // Red
    bg: "rgba(239, 68, 68, 0.20)",
    border: "2px solid #ef4444",
    label: "Missing Element",
    icon: "✕",
    badgeClass: "badge-missing",
  },
};

export default function OverlayCanvas({
  screenshot,
  results = [],
  title,
  hoveredElementId,
  onHoverElement,
}) {
  const [activeTooltipId, setActiveTooltipId] = useState(null);

  // Separate results into positioned boxes vs elements missing bounding boxes
  const positionedResults = results.filter(
    (r) => r.boundingBox && typeof r.boundingBox.x === "number"
  );
  const unpositionedResults = results.filter(
    (r) => !r.boundingBox || typeof r.boundingBox.x !== "number"
  );

  // Calculate default canvas dimensions if no screenshot image is available
  const maxX = positionedResults.reduce(
    (max, r) => Math.max(max, (r.boundingBox?.x || 0) + (r.boundingBox?.width || 0) + 100),
    800
  );
  const maxY = positionedResults.reduce(
    (max, r) => Math.max(max, (r.boundingBox?.y || 0) + (r.boundingBox?.height || 0) + 100),
    500
  );

  const isPlaceholderScreenshot =
    !screenshot ||
    screenshot.includes("PLACEHOLDER") ||
    screenshot.trim() === "";

  return (
    <div className="overlay-canvas-wrapper">
      {title && <div className="canvas-header-title">{title}</div>}

      <div
        className="overlay-canvas-container"
        style={{
          minWidth: isPlaceholderScreenshot ? `${maxX}px` : undefined,
          minHeight: isPlaceholderScreenshot ? `${maxY}px` : undefined,
        }}
      >
        {isPlaceholderScreenshot ? (
          <div
            className="mockup-canvas-bg"
            style={{ width: `${maxX}px`, height: `${maxY}px` }}
          >
            <div className="mockup-browser-bar">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span className="mockup-url">Rendered Output Canvas ({maxX}×{maxY}px)</span>
            </div>
            <div className="mockup-grid-pattern"></div>
          </div>
        ) : (
          <img
            src={screenshot}
            alt="Rendered output"
            className="screenshot-img"
          />
        )}

        {/* Absolutely positioned overlay bounding boxes */}
        {positionedResults.map((result) => {
          const config = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.match;
          const isHovered =
            hoveredElementId === result.elementId ||
            activeTooltipId === result.elementId;

          const { x, y, width, height } = result.boundingBox;

          return (
            <div
              key={result.elementId}
              className={`overlay-box ${config.badgeClass} ${
                isHovered ? "overlay-box-active" : ""
              }`}
              style={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                width: `${Math.max(width, 16)}px`,
                height: `${Math.max(height, 16)}px`,
                border: config.border,
                backgroundColor: config.bg,
                zIndex: isHovered ? 20 : 5,
              }}
              onMouseEnter={() => {
                setActiveTooltipId(result.elementId);
                onHoverElement?.(result.elementId);
              }}
              onMouseLeave={() => {
                setActiveTooltipId(null);
                onHoverElement?.(null);
              }}
              tabIndex={0}
              role="button"
              aria-label={`${result.elementId}: ${config.label}`}
            >
              {/* Corner Tag */}
              <div
                className="overlay-tag"
                style={{
                  backgroundColor: config.color,
                }}
              >
                <span>{config.icon}</span>
                <span className="tag-id">{result.elementId}</span>
              </div>

              {/* Tooltip on Hover */}
              {isHovered && (
                <div
                  className="overlay-tooltip"
                  style={{
                    borderTop: `3px solid ${config.color}`,
                  }}
                  onMouseEnter={(e) => e.stopPropagation()}
                >
                  <div className="tooltip-header">
                    <span
                      className="tooltip-verdict-pill"
                      style={{
                        backgroundColor: config.color,
                        color: "#ffffff",
                      }}
                    >
                      {config.icon} {config.label}
                    </span>
                    <span className="tooltip-el-id">{result.elementId}</span>
                    {result.matchedExtractionId && (
                      <span className="tooltip-dom-id">
                        DOM: {result.matchedExtractionId}
                      </span>
                    )}
                  </div>

                  <div className="tooltip-note">{result.note}</div>

                  {result.checks && result.checks.length > 0 && (
                    <div className="tooltip-checks">
                      <div className="checks-title">Spec Checks:</div>
                      {result.checks.map((c, i) => (
                        <div
                          key={i}
                          className={`check-row ${c.pass ? "check-pass" : "check-fail"}`}
                        >
                          <span className="check-status">{c.pass ? "✓" : "✗"}</span>
                          <span className="check-field">{c.field}:</span>
                          <span className="check-detail">
                            exp: <code>{String(c.expected)}</code>, act:{" "}
                            <code>{String(c.actual)}</code>
                            {typeof c.deltaPx === "number" && (
                              <span className="delta-pill">
                                {c.deltaPx > 0 ? `+${c.deltaPx}px` : `${c.deltaPx}px`}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="tooltip-coords">
                    Box: x={x}, y={y}, w={width}, h={height}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unpositioned / Missing elements fallback list */}
      {unpositionedResults.length > 0 && (
        <div className="missing-elements-panel">
          <div className="missing-title">
            <span className="missing-icon">❌</span>
            <strong>Missing from Rendered DOM ({unpositionedResults.length})</strong>
          </div>
          <ul className="missing-list">
            {unpositionedResults.map((result) => (
              <li
                key={result.elementId}
                className="missing-item"
                onMouseEnter={() => onHoverElement?.(result.elementId)}
                onMouseLeave={() => onHoverElement?.(null)}
              >
                <div className="missing-item-header">
                  <span className="missing-badge">{result.elementId}</span>
                  <span className="missing-verdict-text">VERDICT: MISSING</span>
                </div>
                <div className="missing-item-note">{result.note}</div>
                {result.checks && result.checks.length > 0 && (
                  <div className="missing-item-checks">
                    {result.checks.map((c, i) => (
                      <span key={i} className="failed-check-tag">
                        {c.field}: expected {String(c.expected)}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
