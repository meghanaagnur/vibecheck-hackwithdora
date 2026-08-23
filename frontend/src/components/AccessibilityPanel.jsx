// AccessibilityPanel — surfaces diff.accessibilityIssues (docs/SCHEMA.md section 3).
// Static checks only: missing alt text, missing accessible names, low contrast.
// See backend/src/accessibility.js for what's deliberately NOT attempted (keyboard
// nav, screen reader simulation, full WCAG audits).
const ISSUE_LABELS = {
  "missing-alt": { icon: "🖼️", label: "Missing alt text" },
  "missing-accessible-name": { icon: "🔇", label: "No accessible name" },
  "low-contrast": { icon: "🌓", label: "Low contrast" },
};

export default function AccessibilityPanel({ issues = [] }) {
  if (!issues.length) {
    return (
      <div className="a11y-panel a11y-panel-clean">
        <span className="a11y-panel-icon">♿</span>
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
        <span className="a11y-panel-icon">♿</span>
        <h3>Accessibility</h3>
        <span className="a11y-panel-count">
          {errorCount > 0 && <span className="a11y-count-error">{errorCount} error{errorCount === 1 ? "" : "s"}</span>}
          {errorCount > 0 && warningCount > 0 && " · "}
          {warningCount > 0 && <span className="a11y-count-warning">{warningCount} warning{warningCount === 1 ? "" : "s"}</span>}
        </span>
      </div>
      <ul className="a11y-issue-list">
        {issues.map((issue, i) => {
          const meta = ISSUE_LABELS[issue.issue] || { icon: "⚠️", label: issue.issue };
          return (
            <li key={i} className={`a11y-issue a11y-issue-${issue.severity}`}>
              <span className="a11y-issue-icon">{meta.icon}</span>
              <div className="a11y-issue-body">
                <div className="a11y-issue-top">
                  <span className="a11y-issue-label">{meta.label}</span>
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
