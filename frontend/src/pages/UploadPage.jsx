import { useState } from "react";
import { runCheck } from "../lib/api.js";
import { SAMPLE_DIFF } from "../lib/sampleFixtures.js";

const DEFAULT_SAMPLE_PROMPT =
  "Login page with an email input and a password input stacked vertically, 16px gap between them. Below the password input, a submit button: background #2563EB, white text 'Sign in', 120px wide, 40px tall, centered horizontally, 24px below the password input.";

const DEFAULT_SAMPLE_CODE = `<div style="display:flex; flex-direction:column; width:320px; gap:16px; font-family:sans-serif;">
  <input type="email" placeholder="name@example.com" style="padding:10px; border:1px solid #ccc; border-radius:6px;" />
  <input type="password" placeholder="••••••••" style="padding:10px; border:1px solid #ccc; border-radius:6px;" />
  <button style="background:#2563EB; color:#ffffff; width:120px; height:40px; border:none; border-radius:6px; cursor:pointer; margin-top:8px;">
    Sign in
  </button>
</div>`;

export default function UploadPage({ onCheckSuccess, initialValues = {} }) {
  const [prompt, setPrompt] = useState(initialValues.prompt || "");
  const [code, setCode] = useState(initialValues.code || "");
  const [useAgent, setUseAgent] = useState(initialValues.useAgent || false);
  const [selectedAgent, setSelectedAgent] = useState("gemini");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) {
      setError("Please provide a prompt describing your expected UI design.");
      return;
    }
    if (!useAgent && !code.trim()) {
      setError("Please provide your UI code, or toggle 'Generate code with AI agent'.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const diffResult = await runCheck({
        prompt: prompt.trim(),
        code: code.trim(),
        useAgent,
      });
      onCheckSuccess(diffResult, {
        prompt: prompt.trim(),
        code: code.trim(),
        useAgent,
      });
    } catch (err) {
      console.error("VibeCheck check error:", err);
      setError(err.message || "Failed to run check against backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setPrompt(DEFAULT_SAMPLE_PROMPT);
    setCode(DEFAULT_SAMPLE_CODE);
    setError(null);
  };

  const handleUseFixture = () => {
    onCheckSuccess(SAMPLE_DIFF, {
      prompt: SAMPLE_DIFF.sourcePrompt || DEFAULT_SAMPLE_PROMPT,
      code: DEFAULT_SAMPLE_CODE,
      useAgent: false,
    });
  };

  return (
    <div className="upload-page">
      <header className="page-header">
        <div className="brand-badge">VibeCheck</div>
        <h1 className="main-title">Check the Vibes of Your AI Generated UI</h1>
        <p className="subtitle">
          Diff the rendered reality against your prompt specification. Pinpoint pixel exact
          color, position, and sizing mismatches directly on the rendered output.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="upload-form">
        {error && (
          <div className="alert-box error-alert" role="alert">
            <div className="alert-content">
              <strong>Error running check:</strong> {error}
            </div>
            <div className="alert-actions">
              <button
                type="button"
                className="btn-link"
                onClick={handleUseFixture}
                title="Preview results using verified sample fixture data"
              >
                Preview with Demo Fixture →
              </button>
            </div>
          </div>
        )}

        <div className="form-section">
          <div className="section-header-row">
            <label htmlFor="prompt-input" className="form-label">
              1. Expected UI Specification (Prompt) <span className="required-star">*</span>
            </label>
            <button
              type="button"
              className="btn-ghost-sm"
              onClick={handleLoadSample}
              disabled={loading}
            >
              Load Sample Spec
            </button>
          </div>
          <textarea
            id="prompt-input"
            className="form-textarea prompt-textarea"
            rows={4}
            placeholder="e.g. Login page with email and password inputs stacked vertically with 16px gap. Submit button below with #2563EB background, 120px wide, centered 24px below password input."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            required
          />
          <span className="field-hint">
            Be specific with colors (e.g. #2563EB), pixel offsets, and element relationships.
          </span>
        </div>

        <div className="form-section agent-toggle-card">
          <div className="toggle-row">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={useAgent}
                onChange={(e) => setUseAgent(e.target.checked)}
                disabled={loading}
              />
              <span className="toggle-text">
                <strong>Generate code automatically with AI Agent</strong>
              </span>
            </label>

            {useAgent && (
              <div className="agent-selector-group">
                <label htmlFor="agent-select" className="agent-select-label">
                  Agent Engine:
                </label>
                <select
                  id="agent-select"
                  className="form-select"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  disabled={loading}
                >
                  <option value="gemini">Gemini (Active)</option>
                  <option value="claude" disabled>
                    Claude (Coming soon)
                  </option>
                  <option value="gpt4" disabled>
                    GPT-4o (Coming soon)
                  </option>
                </select>
              </div>
            )}
          </div>
          {useAgent && (
            <p className="agent-notice">
              Gemini will generate HTML/React code from your prompt, render it headlessly, extract
              DOM geometry, and verify against the checklist.
            </p>
          )}
        </div>

        <div className={`form-section ${useAgent ? "section-dimmed" : ""}`}>
          <label htmlFor="code-input" className="form-label">
            2. Code Snippet {useAgent ? <span className="optional-tag">(Optional with Agent)</span> : <span className="required-star">*</span>}
          </label>
          <textarea
            id="code-input"
            className="form-textarea code-textarea"
            rows={7}
            placeholder={
              useAgent
                ? "Optional: Leave empty to let Gemini generate the code, or paste existing code to inspect."
                : "Paste your generated HTML/CSS or React component code here..."
            }
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner-wrap">
                <span className="spinner"></span> Checking vibes...
              </span>
            ) : (
              "Run VibeCheck →"
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleUseFixture}
            disabled={loading}
            title="Load sample run to view visual diff overlay"
          >
            Load Demo Gallery Run
          </button>
        </div>
      </form>
    </div>
  );
}
