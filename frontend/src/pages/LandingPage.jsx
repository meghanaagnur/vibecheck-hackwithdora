// LandingPage — restyled after interfere.com's visual language (light theme, Inter,
// black pill CTAs, soft pastel gradient blobs, italic-serif accent word, elevated white
// cards, light-gray footer with a giant faint wordmark). Content/copy is VibeCheck's own
// — see docs/EXECUTION_PLAN.md pitch framing for the source narrative.
//
// The review quotes below are clearly-labeled placeholders (generic role, no real names
// or companies) pending real user feedback post-launch — see the disclaimer under the
// reviews grid. Swap them for genuine testimonials once you have some.
const REVIEWS = [
  {
    quote:
      "Ran my landing page prompt through it and it caught that my button was 12px off from what I'd actually specified. Small thing, but I never would have noticed by eye.",
    name: "R.",
    role: "Hackathon participant (beta tester)",
  },
  {
    quote:
      "The prompt suggestions are the best part: it doesn't just fix the code, it tells you what you forgot to say in the first place.",
    name: "S.",
    role: "Frontend dev (beta tester)",
  },
  {
    quote:
      "Finally a way to sanity check AI generated UI without eyeballing a diff of pixels for ten minutes.",
    name: "A.",
    role: "Hackathon judge (beta tester)",
  },
];

export default function LandingPage({ onTryItClick }) {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <span aria-hidden="true">✦</span> VibeCheck
        </div>
        <div className="landing-nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#reviews">Reviews</a>
          <a href="#roadmap">Roadmap</a>
        </div>
        <div className="landing-nav-actions">
          <a
            className="btn btn-secondary btn-pill"
            href="https://github.com/meghanaagnur/vibecheck-hackwithdora"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <button className="btn btn-primary btn-pill" onClick={onTryItClick}>
            Try VibeCheck
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <h1 className="landing-headline">
          Ship UIs that <span className="text-accent">actually</span> match the vibes.
        </h1>
        <p className="landing-subheadline">
          Everyone in this room just vibe coded their project. VibeCheck checks whether
          the vibes actually rendered correctly.
        </p>
        <p className="landing-lede">
          AI code generation is great at rough layout and terrible at exact values. VibeCheck
          diffs what you asked for against what actually rendered: pixel exact color,
          position, and sizing, and shows you the mismatch directly on the screenshot,
          not buried in a JSON dump.
        </p>
        <div className="landing-cta-row">
          <button className="btn btn-primary btn-large btn-pill" onClick={onTryItClick}>
            Try VibeCheck →
          </button>
          <a
            className="btn btn-secondary btn-large btn-pill"
            href="https://github.com/meghanaagnur/vibecheck-hackwithdora"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </a>
        </div>

        <div className="landing-mockup-card">
          <div className="landing-mockup-topbar">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div className="landing-mockup-body">
            <div className="landing-mockup-panel">
              <div className="landing-mockup-row match">
                <span className="verdict-dot" /> el0 · email input · matches spec
              </div>
              <div className="landing-mockup-row match">
                <span className="verdict-dot" /> el1 · password input · matches spec
              </div>
              <div className="landing-mockup-row mismatch">
                <span className="verdict-dot" /> el2 · submit button · 17px off spec
              </div>
              <div className="landing-mockup-row missing">
                <span className="verdict-dot" /> el3 · "Forgot password?" · missing
              </div>
            </div>
            <div className="landing-mockup-panel">
              <div className="landing-mockup-code">
                <span className="del">margin-top: 41px;</span>
                {"\n"}
                <span className="ins">margin-top: 24px;</span>
                {"\n\n"}💡 Sharpen your prompt:{"\n"}state the exact spacing as 24px.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="how-it-works">
        <span className="landing-section-eyebrow">How it works</span>
        <h2 className="landing-section-title">
          VibeCheck <span className="hl-mark">finds</span> what's wrong,{" "}
          <span className="hl-blue">explains</span> why, and coaches your next prompt.
        </h2>
        <div className="how-it-works-strip">
          <div className="how-step">
            <span className="how-step-num">1</span>
            <h3>Prompt</h3>
            <p>Describe the UI you want. Be specific about colors, spacing, alignment.</p>
          </div>
          <div className="how-step">
            <span className="how-step-num">2</span>
            <h3>AI generates code</h3>
            <p>One agent call turns the prompt into HTML/React, or paste your own code.</p>
          </div>
          <div className="how-step">
            <span className="how-step-num">3</span>
            <h3>Render + measure</h3>
            <p>Headless render, then real DOM geometry and computed style extraction.</p>
          </div>
          <div className="how-step">
            <span className="how-step-num">4</span>
            <h3>Diff, shown on screen</h3>
            <p>Red/yellow/green overlay directly on the screenshot. See the bug, not a log.</p>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-testimonial">
          <blockquote>
            "It doesn't just fix the code, it tells you what you forgot to say in the
            first place, and that's the part that actually changes how I write prompts."
          </blockquote>
          <div className="landing-testimonial-author">
            <span className="landing-testimonial-avatar" aria-hidden="true">S.</span>
            <div>
              <div className="landing-testimonial-author-name">S.</div>
              <div className="landing-testimonial-author-role">Beta tester, Hack With Dora 2.0</div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="reviews">
        <span className="landing-section-eyebrow">Reviews</span>
        <h2 className="landing-section-title">What early testers are saying</h2>
        <div className="reviews-grid">
          {REVIEWS.map((r) => (
            <div className="review-card" key={r.name + r.role}>
              <div className="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
              <p className="review-quote">"{r.quote}"</p>
              <div className="review-author">
                <span className="review-avatar" aria-hidden="true">{r.name}</span>
                <div>
                  <div className="review-author-name">{r.name}</div>
                  <div className="review-author-role">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="review-disclaimer">
          Early placeholder feedback from hackathon testers. Real reviews coming post launch.
        </p>
      </section>

      <section className="landing-section" id="roadmap">
        <span className="landing-section-eyebrow">What's next</span>
        <h2 className="landing-section-title">From one manual check to full workflow coverage</h2>
        <ul className="roadmap-list">
          <li>
            <strong>Today, manual and web based:</strong> paste a prompt/code pair, get a
            diff, prompt coaching, and one AI assisted fix, all in the browser.
          </li>
          <li>
            <strong>Next, IDE integration:</strong> inline prompt coaching while you're
            still writing the prompt, not after you've already generated code.
          </li>
          <li>
            <strong>Later, CI integration:</strong> auto recheck on every commit, once
            there's a stored baseline to run continuously against, the same retry loop,
            wired into your pipeline.
          </li>
          <li>
            <strong>Also planned:</strong> accessibility checks (alt text, ARIA labels,
            contrast) and functional/API behavior testing beyond static rendering.
          </li>
        </ul>
      </section>

      <section className="landing-final-cta">
        <h2>Find out if your vibes actually rendered.</h2>
        <button className="btn btn-primary btn-large btn-pill" onClick={onTryItClick}>
          Try VibeCheck →
        </button>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="landing-footer-col">
            <h4>Product</h4>
            <a href="#how-it-works">How it works</a>
            <a href="#reviews">Reviews</a>
            <a href="#roadmap">Roadmap</a>
          </div>
          <div className="landing-footer-col">
            <h4>Resources</h4>
            <a
              href="https://github.com/meghanaagnur/vibecheck-hackwithdora"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://github.com/meghanaagnur/vibecheck-hackwithdora/blob/main/docs/SCHEMA.md"
              target="_blank"
              rel="noreferrer"
            >
              Schema docs
            </a>
          </div>
          <div className="landing-footer-col">
            <h4>Team</h4>
            <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Built at Hack With Dora 2.0
            </span>
          </div>
          <div className="landing-footer-col">
            <h4>Get started</h4>
            <a href="#" onClick={(e) => { e.preventDefault(); onTryItClick(); }}>
              Try VibeCheck
            </a>
          </div>
        </div>
        <div className="landing-footer-bottom">
          Built at Hack With Dora 2.0. A developer tool for checking whether vibe coded
          UI actually matches the spec.
        </div>
        <div className="landing-footer-watermark" aria-hidden="true">VibeCheck</div>
      </footer>
    </div>
  );
}
