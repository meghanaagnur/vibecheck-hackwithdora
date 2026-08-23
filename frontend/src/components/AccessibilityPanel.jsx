// AccessibilityPanel — surfaces diff.accessibilityIssues (docs/SCHEMA.md section 3).
// Static checks only: missing alt text, missing accessible names, low contrast.
// See backend/src/accessibility.js for what's deliberately NOT attempted (keyboard
// nav, screen reader simulation, full WCAG audits).
//
// Icons follow the same ✓ / ⚠ / ✕ language OverlayCanvas already uses for verdicts —
// no decorative emoji, to stay consistent with the rest of the app.
const ISSUE_LABELS = {
  "missing-alt": "Missing alt text",
  "missing-accessible-name": "No accessible name",
  "low-contrast": "Low contrast",
};

function severityIcon(severity) {
  return severity === "error" ? "✕" : "⚠";
}

export default function AccessibilityPanel({ issues = [] }) {
  if (!issues.length) {
    return (
      <div className="a11y-panel a11y-panel-clean">
        <span className="a11y-panel-icon a11y-panel-icon-clean">✓</span>
        <div>
          <h3>Accessibility</h3>
          <p className="a11y-panel-clean-note">
            No issues found in alt text, accessible names, or color contrast.
          </p>
        </div>
      </div>
    );
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return (
    <div className="a11y-panel">
      <div className="a11y-panel-header">
        <h3>Accessibility</h3>
        <span className="a11y-panel-count">
          {errorCount > 0 && <span className="a11y-count-error">{errorCount} error{errorCount === 1 ? "" : "s"}</span>}
          {errorCount > 0 && warningCount > 0 && " · "}
          {warningCount > 0 && <span className="a11y-count-warning">{warningCount} warning{warningCount === 1 ? "" : "s"}</span>}
        </span>
      </div>
      <ul className="a11y-issue-list">
        {issues.map((issue, i) => {
          const label = ISSUE_LABELS[issue.issue] || issue.issue;
          return (
            <li key={i} className={`a11y-issue a11y-issue-${issue.severity}`}>
              <span className={`a11y-issue-icon a11y-issue-icon-${issue.severity}`}>
                {severityIcon(issue.severity)}
              </span>
              <div className="a11y-issue-body">
                <div className="a11y-issue-top">
                  <span className="a11y-issue-label">{label}</span>
                  <span className="a11y-issue-tag">{issue.tag}</span>
                  <span className="a11y-issue-el">{issue.elementId}</span>
                </div>
                <p className="a11y-issue-message">{issue.message}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
