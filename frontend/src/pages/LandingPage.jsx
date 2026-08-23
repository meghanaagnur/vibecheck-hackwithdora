// LandingPage — the pitch surface judges/visitors see first.
// Content follows docs/EXECUTION_PLAN.md pitch framing: hook, problem, how it works,
// differentiation from Percy/Chromatic/Applitools, roadmap. Routes into the app via
// onTryItClick (App.jsx swaps to the upload view).
export default function LandingPage({ onTryItClick }) {
  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="brand-badge">VibeCheck</div>
        <h1 className="landing-headline">
          Everyone in this room just <span className="text-accent">vibe-coded</span> their
          project.
        </h1>
        <p className="landing-subheadline">
          VibeCheck is the tool that checks whether the vibes actually rendered correctly.
        </p>
        <p className="landing-lede">
          AI code-gen is great at rough layout and terrible at exact values. VibeCheck diffs
          what you asked for against what actually rendered — pixel-exact color, position,
          and sizing — and shows you the mismatch directly on the screenshot, not buried in
          a JSON dump.
        </p>
        <div className="landing-cta-row">
          <button className="btn btn-primary btn-large" onClick={onTryItClick}>
            Try VibeCheck →
          </button>
          <a
            className="btn btn-secondary btn-large"
            href="https://github.com/meghanaagnur/vibecheck-hackwithdora"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">How it works</h2>
        <div className="how-it-works-strip">
          <div className="how-step">
            <span className="how-step-num">1</span>
            <h3>Prompt</h3>
            <p>Describe the UI you want — be specific about colors, spacing, alignment.</p>
          </div>
          <span className="how-arrow" aria-hidden="true">→</span>
          <div className="how-step">
            <span className="how-step-num">2</span>
            <h3>AI generates code</h3>
            <p>One agent call turns the prompt into HTML/React — or paste your own code.</p>
          </div>
          <span className="how-arrow" aria-hidden="true">→</span>
          <div className="how-step">
            <span className="how-step-num">3</span>
            <h3>Render + measure</h3>
            <p>Headless render, then real DOM geometry and computed style extraction.</p>
          </div>
          <span className="how-arrow" aria-hidden="true">→</span>
          <div className="how-step">
            <span className="how-step-num">4</span>
            <h3>Diff, shown on screen</h3>
            <p>Red/yellow/green overlay directly on the screenshot — see the bug, not a log.</p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-diff-section">
        <h2 className="landing-section-title">Not another visual regression tool</h2>
        <div className="diff-compare-grid">
          <div className="diff-compare-card">
            <h3>Percy / Chromatic / Applitools</h3>
            <p>
              "Does the UI look the same as last time?" — regression testing against a
              previous screenshot.
            </p>
          </div>
          <div className="diff-compare-card diff-compare-highlight">
            <h3>VibeCheck</h3>
            <p>
              "Does the UI match what I actually asked for?" — spec conformance testing
              against the prompt, not a previous run.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">What's next</h2>
        <ul className="roadmap-list">
          <li>
            <strong>Accessibility checks</strong> — missing alt text, ARIA labels, color
            contrast, computed from data VibeCheck already extracts.
          </li>
          <li>
            <strong>Functional &amp; logic correctness</strong> — click flows, state
            transitions, beyond static rendering.
          </li>
          <li>
            <strong>API behavior testing</strong> — verifying generated backend code the
            same way VibeCheck verifies generated UI.
          </li>
          <li>
            <strong>More agents</strong> — bring your own code-gen model, not just one.
          </li>
        </ul>
      </section>

      <footer className="landing-footer">
        <button className="btn btn-primary" onClick={onTryItClick}>
          Try VibeCheck →
        </button>
        <p className="landing-footer-note">Built at Hack With Dora 2.0</p>
      </footer>
    </div>
  );
}
